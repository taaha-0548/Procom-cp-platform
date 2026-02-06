# PhantomVerse Scraper Script

## Configuration

Edit `main.js` directly to configure **everything**:

```javascript
// Lines 15-17: VJudge contest URL
const LEADERBOARD_URL = "https://vjudge.net/contest/YOUR_CONTEST_ID#rank";

// Line 20: Backend URL
const BACKENDURL = "http://localhost:4000";

// Lines 23-25: Contest timing
const CONTEST_START = "2026-02-06T18:00:00+05:00";
const CONTEST_DURATION = 300; // minutes
```

All settings are in the script - no .env needed!

## Usage

1. **Update configuration** at the top of `main.js`
2. **Run:**
   ```bash
   node main.js
   ```

The script will:
- Scrape your VJudge contest every 30 seconds
- Send data to backend at `http://localhost:4000`
- Automatically stop when contest ends

## Optional Environment Variables

Only if you want to override via .env:
- `KEY` - Backend authentication key
- `SCRAPING_INTERVAL` - Scraping interval in ms (default: 30000)
