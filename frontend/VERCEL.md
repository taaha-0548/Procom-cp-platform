# Vercel Deployment - Quick Reference

## What to Set in Vercel

Go to your Vercel project → **Settings** → **Environment Variables** and add:

### Required Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_BACKEND_URL` | `https://your-backend-url.com` | Your deployed backend URL |
| `VITE_USE_MOCK_DATA` | `false` | Disable mock mode |

**That's it!** Only 2 environment variables needed.

## Deployment Steps

1. **Configure contest timing** in `script/main.js`:
   ```javascript
   const LEADERBOARD_URL = "https://vjudge.net/contest/YOUR_ID#rank";
   const CONTEST_START = "2026-02-06T18:00:00+05:00";
   const CONTEST_DURATION = 300; // minutes
   ```

2. **Start the script** to post timing to backend:
   ```bash
   node script/main.js
   ```

3. **Push to GitHub** (code is ready)

4. **Import to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select your repository
   - **Root Directory:** `frontend`
   - Framework: Vite (auto-detected)

5. **Add Environment Variables** (see table above)

6. **Deploy!**

## How Contest Timing Works

```
Script (main.js) → Backend API → Frontend
```

1. Script has timing configured in code
2. Script posts timing to backend on startup
3. Frontend automatically fetches timing from backend
4. **No environment variables needed for timing!**

## Example Backend URLs

Depending on where you deploy backend:
- Render: `https://your-app.onrender.com`
- Railway: `https://your-app.railway.app`
- Vercel: `https://your-backend.vercel.app`
- Local testing: `http://localhost:4000`
