# PhantomVerse Scoreboard Platform

Real-time competitive programming scoreboard with dramatic PhantomVerse theme featuring split reality aesthetics (Red/Cyan smoke effects).

## 🎯 Project Structure

```
Procom cp platform/
├── frontend/          # React + Vite scoreboard UI
├── backend/           # Express.js API server
├── script/            # VJudge scraper
└── .env              # Shared configuration
```

## 🚀 Quick Start

### 1. Configure Environment

Edit `.env` in the root directory with your contest details:

```env
# Contest Configuration
VITE_CONTEST_START=2026-02-06T18:00:00+05:00
VITE_CONTEST_DURATION=300
VITE_BACKEND_URL=http://localhost:4000
VITE_USE_MOCK_DATA=false

# Backend
PORT=4000
KEY=dev-secret-key

# Script
LEADERBOARD_URL="https://vjudge.net/contest/YOUR_CONTEST_ID#rank"
```

### 2. Run Development

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

**Backend:**
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:4000
```

**Scraper:**
```bash
cd script
npm install
node index.js
```

## 📦 Deployment

### Frontend (Vercel)

See [frontend/DEPLOY.md](./frontend/DEPLOY.md) for detailed Vercel deployment guide.

**Quick Deploy:**
1. Push to GitHub
2. Import to Vercel
3. Set root directory to `frontend`
4. Add environment variables
5. Deploy

### Backend (Render/Railway/etc)

Deploy backend API to any Node.js hosting platform. Ensure:
- Environment variables are set
- CORS configured for frontend domain
- Port binding configured

## 🎨 Features

- **Real-time Updates** - Socket.io powered live leaderboard
- **Split Reality Theme** - Red/Cyan smoke effects for dramatic reveals
- **Contest Ended Modal** - Billowing smoke podium for top 2 champions
- **Smooth Animations** - Framer Motion powered rank swaps
- **Sound Effects** - Optional audio for dramatic moments
- **Responsive Design** - Works on all screen sizes

## 🛠️ Technology Stack

**Frontend:**
- React 19
- Vite
- Framer Motion
- Socket.io Client
- Tailwind CSS

**Backend:**
- Express.js
- Socket.io
- CORS

**Scraper:**
- Puppeteer
- Axios

## 📝 Configuration

All configuration is centralized in the root `.env` file:
- `VITE_*` variables → Frontend
- `PORT`, `KEY` → Backend  
- `LEADERBOARD_URL`, `SCRAPING_INTERVAL` → Scraper

## 🔧 Development Tips

- Set `VITE_USE_MOCK_DATA=true` for testing without backend
- Mock data simulates realistic contest activity
- Sound toggle available in the UI

## 📖 Documentation

- **Frontend Deployment:** [frontend/DEPLOY.md](./frontend/DEPLOY.md)
- **Frontend README:** [frontend/README.md](./frontend/README.md)

## 🎭 Theme

PhantomVerse uses the "Fracture" color palette:
- **Neon Crimson** (#ff2a4d) - Red Reality / Erevos
- **Neon Cyan** (#00ffff) - Ghost / PixelVerse
- **Deep Void** (#050000) - Dark background
- **Pale Rose** (#ffced6) - Glowing text

## 📄 License

© 2026 PROCOM - Competitive Programming Platform
