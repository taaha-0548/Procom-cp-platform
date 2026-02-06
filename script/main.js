import dotenv from "dotenv";
import puppeteer from "puppeteer";
import UserAgent from "user-agents";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables from root .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const KEY = process.env.KEY;

// ==================== CONTEST CONFIGURATION ====================
// Update VJudge contest URL before running
const LEADERBOARD_URL = "https://vjudge.net/contest/786329#rank";
// ==============================================================

// Backend URL - can be set via environment variable
const BACKENDURL = process.env.BACKEND_URL || "http://localhost:4000";

// ==================== CONTEST TIMING CONFIGURATION ====================
// Update these values directly before running the script
const CONTEST_START = "2026-02-06T18:00:00+05:00";  // Contest start time (ISO 8601)
const CONTEST_DURATION = 300;  // Duration in minutes
// ======================================================================

// Calculate contest end time
const calculateContestEnd = () => {
    const startDate = new Date(CONTEST_START);
    const durationMs = CONTEST_DURATION * 60 * 1000;
    const endDate = new Date(startDate.getTime() + durationMs);

    // Format to match start time timezone format
    const year = endDate.getFullYear();
    const month = String(endDate.getMonth() + 1).padStart(2, '0');
    const day = String(endDate.getDate()).padStart(2, '0');
    const hours = String(endDate.getHours()).padStart(2, '0');
    const minutes = String(endDate.getMinutes()).padStart(2, '0');
    const seconds = String(endDate.getSeconds()).padStart(2, '0');

    // Extract timezone from CONTEST_START
    const timezone = CONTEST_START.substring(CONTEST_START.lastIndexOf('+'));
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${timezone}`;
};

const CONTEST_END = calculateContestEnd();

// Log the calculated values
console.log('📅 Contest timing calculated:');
console.log('   Start:', CONTEST_START);
console.log('   End:', CONTEST_END);
console.log('   Duration:', CONTEST_DURATION, 'minutes');

// Scraping interval (milliseconds)
const SCRAPING_INTERVAL = parseInt(process.env.SCRAPING_INTERVAL || "30000");
// ==============================================================

const VIEWPORT = { width: 1920, height: 1080 };
const RANK_TABLE_SELECTOR = "#contest-rank-table";

const launchBrowser = async () => {
    try {
        return await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
            defaultViewport: VIEWPORT,
        });
    } catch (error) {
        console.error("Error launching Puppeteer:", error);
        throw error;
    }
};

const newConfiguredPage = async (browser) => {
    const page = await browser.newPage();
    await page.setUserAgent(new UserAgent().toString());
    return page;
};

const waitForRankTable = async (page) => {
    try {
        await page.waitForSelector(RANK_TABLE_SELECTOR, { timeout: 30000 });
    } catch (e) {
        throw e;
    }
};

const extractLeaderboard = async (page) => {
    return page.evaluate(() => {
        const rows = document.querySelectorAll("#contest-rank-table tbody tr");
        const result = [];

        rows.forEach((row) => {
            const rank = row.querySelector("td.rank")?.innerText.trim() || "N/A";
            const teamName = row.querySelector("td.team a")?.innerText.trim() || "N/A";
            const score = row.querySelector("td.solved span")?.innerText.trim() || "N/A";
            const penalty = row.querySelector("td.penalty span.minute")?.innerText.trim() || "N/A";
            const problems = [];

            const problemCells = row.querySelectorAll("td.prob");
            problemCells.forEach((cell) => {
                const accepted = cell.classList.contains("accepted");
                const failed = cell.classList.contains("failed");
                const firstSolve = cell.classList.contains("fb");

                let problemStatus = "Not attempted";
                let time = "";

                if (accepted) {
                    problemStatus = "Accepted";
                    time = cell.innerText.split("<br>")[0].trim().split("\n")[0].trim();
                } else if (failed) {
                    problemStatus = "Failed";
                }

                let penalty = "";
                const spanElement = cell.querySelector("span");
                if (spanElement) {
                    penalty = spanElement.innerText.trim();
                }

                problems.push({ status: problemStatus, time, penalty, firstSolve });
            });

            result.push({ rank, teamName, score, penalty, problems });
        });
        // return result;
        return result;
    });
};

export const getData = async (URL) => {
    let browser = null;
    try {
        browser = await launchBrowser();
        const page = await newConfiguredPage(browser);
        await page.goto(URL, { waitUntil: "networkidle0" });

        try {
            await waitForRankTable(page);
        } catch (e) {
            console.error("Table not found:", e);
            await page.screenshot({ path: path.join(__dirname, "error_screenshot.png") });
            // console.log(await page.content());
            return { error: "Table not found" };
        }

        const data = await extractLeaderboard(page);
        return data;
    } catch (err) {
        console.error("Unexpected scraping error:", err);
        return { error: "Unexpected scraping error" };
    } finally {
        if (browser) {
            try {
                await browser.close();
            } catch { }
        }
    }
};

export const postData = async (data) => {
    try {
        const response = await fetch(`${BACKENDURL}/api/postRanking`, {
            method: "POST",
            body: JSON.stringify({
                data: data.rows
            }),
            headers: {
                "Content-Type": "application/json",
                key: KEY,
            },
        });

        if (!response.ok) {
            console.error("Status:", response.status, response.statusText);
            throw new Error(`Network response was not ok`);
        }

        const json = await response.json();
        console.log(`Data sent successfully:`, json);
    } catch (error) {
        console.error("Error sending data:", error);
    }
};

export const scrapeAndSendData = async () => {
    console.log(`Scraping data from: ${LEADERBOARD_URL}`);

    const data = await getData(LEADERBOARD_URL);

    // If scraping failed or returned error object
    if (!Array.isArray(data)) {
        console.error("No valid array data scraped:", data);
        return;
    }

    // Now it's safe to use .filter
    const updatedData = data.filter(item => item.rank !== "--");

    if (updatedData.length === 0) {
        console.warn(`No valid rows after filtering`);
        return;
    }

    console.log("Posting data to backend...");
    await postData({
        rows: updatedData
    });
};

export const postTime = async (startTime, duration) => {
    try {
        const response = await fetch(`${BACKENDURL}/api/postContestTime`, {
            method: "POST",
            body: JSON.stringify({ startTime, duration }),
            headers: {
                "Content-Type": "application/json",
                key: KEY,
            },
        });

        if (!response.ok) {
            console.error("Status:", response.status, response.statusText);
            throw new Error(`Network response was not ok`);
        }

        const json = await response.json();
        console.log(`Contest time posted successfully:`, json);
    } catch (error) {
        console.error("Error posting contest time:", error);
    }
};

// Function to clear data buffer
export const clearData = async () => {
    try {
        console.log(`Clearing data buffer...`);

        await postData({
            rows: []
        });

        console.log(`Data buffer cleared`);
    } catch (error) {
        console.error(`Error clearing data buffer:`, error);
    }
};

// Check if contest has ended
const isContestEnded = () => {
    const now = new Date();
    const contestStart = new Date(CONTEST_START);
    const contestDuration = CONTEST_DURATION;
    const contestEnd = new Date(contestStart.getTime() + (contestDuration * 60 * 1000));
    return now > contestEnd;
};

// Initial setup: clear buffer (uncomment if needed)
// await clearData();

// Post contest time once at the start
postTime(CONTEST_START, CONTEST_DURATION);

// Start scraping immediately
scrapeAndSendData();

// Set interval for continuous scraping with contest end check
const scrapingInterval = setInterval(() => {
    // Check if contest has ended
    if (isContestEnded()) {
        console.log("🏁 Contest has ended. Stopping script.");
        console.log("Final leaderboard data will remain available on the backend.");
        clearInterval(scrapingInterval);
        process.exit(0);
    }

    scrapeAndSendData();
}, SCRAPING_INTERVAL);

console.log(`🚀 Script started! Scraping every ${SCRAPING_INTERVAL / 1000} seconds from: ${LEADERBOARD_URL}`);
console.log(`📅 Contest will auto-stop when ended.`);