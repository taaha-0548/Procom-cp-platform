import express from 'express';
import Authenticate from '../middleware/auth.js';
import updateBuffer from '../bufferController/bufferFunctions.js';

export default function rankingRoutes(io) {
    const router = express.Router();


    // Global scoreboard buffer for all usernames
    let buffer = {
        scoreboard: {
            version: 0,
            ts: null,
            rows: []
        }
    };

    // Calculate contest times from environment variables
    const getContestTimes = () => {
        const startTimeEnv = process.env.VITE_CONTEST_START;
        const durationEnv = process.env.VITE_CONTEST_DURATION;
        
        if (startTimeEnv && durationEnv) {
            const startTime = startTimeEnv;
            const startDate = new Date(startTimeEnv);
            const durationMs = parseInt(durationEnv) * 60 * 1000; // Convert minutes to milliseconds
            
            // Simple approach: add duration to start time
            const endDate = new Date(startDate.getTime() + durationMs);
            
            // Format as ISO string but preserve the local timezone from start time
            // startTime: "2026-02-01T17:45:00+05:00"
            // We want: "2026-02-01T22:45:00+05:00" (5 hours later in same timezone)
            
            // Get the timezone part from start time
            const timezone = startTime.substring(startTime.lastIndexOf('+'));
            
            // Format the end date in ISO format but use local time components
            const localYear = startDate.getFullYear();
            const localMonth = String(startDate.getMonth() + 1).padStart(2, '0');
            const localDay = String(startDate.getDate()).padStart(2, '0');
            
            // Calculate end time in local timezone
            const endLocalTime = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 
                                         startDate.getHours(), startDate.getMinutes(), startDate.getSeconds());
            endLocalTime.setTime(endLocalTime.getTime() + durationMs);
            
            const endHours = String(endLocalTime.getHours()).padStart(2, '0');
            const endMinutes = String(endLocalTime.getMinutes()).padStart(2, '0');
            const endSeconds = String(endLocalTime.getSeconds()).padStart(2, '0');
            
            const endTime = `${localYear}-${localMonth}-${localDay}T${endHours}:${endMinutes}:${endSeconds}${timezone}`;
            
            console.log(`📅 Contest timing: ${startTime} to ${endTime} (${durationEnv} minutes)`);
            console.log(`🕐 Start: ${startDate.toString()}`);
            console.log(`🕐 End: ${endDate.toString()}`);
            console.log(`⏱️ Duration: ${durationMs / (60 * 1000)} minutes`);
            
            return { startTime, endTime };
        }
        
        return { startTime: null, endTime: null };
    };

    let contestTimes = { 
        startTime: getContestTimes().startTime, 
        duration: parseInt(process.env.VITE_CONTEST_DURATION || "300")
    };


    let version = 0;
    let lastSnapshot = []; // global rows

    io.on("connection", (socket) => {
        console.log("A user connected");


        socket.on("joinRoom", (room) => {
            if (room === "scoreboard") {
                socket.join(room);
                console.log(`User joined scoreboard room`);
                socket.emit("sendData", buffer.scoreboard);
            } else {
                console.log("Invalid room");
            }
        });

        socket.on("disconnect", () => {
            console.log("User disconnected");
        });
    });

    router.post('/postRanking', Authenticate, async (req, res) => {
        const { data } = req.body;

        if (!Array.isArray(data)) {
            return res.status(400).json({ error: "Invalid data: expected array" });
        }

        console.log('📊 Received ranking data:', JSON.stringify(data, null, 2));

        version += 1;
        const rows = data.map(row => ({
            userId: row.teamName, // now just username
            rank: Number(row.rank),
            teamName: row.teamName,  // Frontend expects teamName field
            username: row.teamName,  // Keep for backward compatibility
            score: Number(row.score),
            penalty: Number(row.penalty),
            problems: row.problems
        }));

        console.log('📋 Processed rows:', JSON.stringify(rows, null, 2));

        lastSnapshot = rows;

        buffer.scoreboard = {
            version,
            ts: Date.now(),
            rows
        };

        console.log(`Global scoreboard buffer updated.`);

        io.to("scoreboard").emit("sendData", buffer.scoreboard);

        return res.status(200).json({ message: "Buffer updated" });
    });

    router.get('/getRanking', (req, res) => {
        if (buffer && buffer.scoreboard) {
            return res.status(200).json(buffer.scoreboard);
        }
        return res.status(404).json({ error: "No scoreboard data found" });
    });

    router.get('/getHouseRanking', (req, res) => {
        if (buffer['Houses']) {
            return res.status(200).json(buffer['Houses']);
        }
        return res.status(404).json({ error: "No house ranking data found" });
    });

    router.post('/postContestTime', Authenticate, (req, res) => {
        const { startTime, duration } = req.body;
        
        // Store start time and duration
        contestTimes.startTime = startTime;
        contestTimes.duration = duration;
        
        console.log(`⏰ Contest times updated - Start: ${startTime}, Duration: ${duration}min`);
        console.log('✅ Contest times updated successfully');
        return res.status(200).json({ message: "Contest time updated" });
    });

    router.get('/getContestTime', (req, res) => {
        // Calculate endTime from startTime + duration
        if (contestTimes.startTime && contestTimes.duration) {
            const startDate = new Date(contestTimes.startTime);
            const durationMs = parseInt(contestTimes.duration) * 60 * 1000;
            const endDate = new Date(startDate.getTime() + durationMs);
            
            // Format endTime in same timezone as startTime
            const timezone = contestTimes.startTime.substring(contestTimes.startTime.lastIndexOf('+'));
            const endLocalTime = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 
                                         startDate.getHours(), startDate.getMinutes(), startDate.getSeconds());
            endLocalTime.setTime(endLocalTime.getTime() + durationMs);
            
            const year = endLocalTime.getFullYear();
            const month = String(endLocalTime.getMonth() + 1).padStart(2, '0');
            const day = String(endLocalTime.getDate()).padStart(2, '0');
            const hours = String(endLocalTime.getHours()).padStart(2, '0');
            const minutes = String(endLocalTime.getMinutes()).padStart(2, '0');
            const seconds = String(endLocalTime.getSeconds()).padStart(2, '0');
            
            const endTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${timezone}`;
            
            return res.status(200).json({ 
                startTime: contestTimes.startTime, 
                endTime,
                duration: contestTimes.duration 
            });
        }
        return res.status(200).json(contestTimes);
    });

    router.get('/getTopTeams/:batch', (req, res) => {
        // Now returns top 3 users globally
        if (!buffer.scoreboard || !Array.isArray(buffer.scoreboard.rows)) {
            return res.status(404).json({ error: "No data available yet" });
        }
        const sorted = [...buffer.scoreboard.rows].sort((a, b) => a.rank - b.rank);
        if (sorted.length < 3) {
            return res.status(400).json({
                error: "Not enough users yet",
                message: `Only ${sorted.length} user(s) available`,
            });
        }
        const top3 = sorted.slice(0, 3);
        return res.status(200).json(top3);
    });


    return router;
};
