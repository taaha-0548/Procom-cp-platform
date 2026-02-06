# PhantomVerse Scoreboard - Deployment Guide

## 🚀 Deploy to Vercel

1. **Configure** root `.env` file with contest details
2. **Set** `VITE_USE_MOCK_DATA=false` for production
3. **Deploy** to Vercel

## 📋 Environment Variables

Configure in Vercel dashboard or root `.env`:

- `VITE_CONTEST_START` - Contest start time (ISO 8601)
- `VITE_CONTEST_DURATION` - Duration in minutes
- `VITE_BACKEND_URL` - Backend API URL
- `VITE_USE_MOCK_DATA` - Set to `false` for production

## 🌐 Vercel Deployment

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

Vercel auto-detects Vite configuration.
