import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIO } from "socket.io";
import rankingRoutes from './routes/ranking.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from root .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3001',
    'http://localhost:3000',
    'https://coderscup-scoreboard-2025.vercel.app',
    'https://coderscup-scoreboard-2025-raahims-projects-f828742c.vercel.app',
    'https://scoreboard.acmnuceskhi.com',
    'https://procom-cp-platform.vercel.app',
  ],
  credentials: true
}));

const io = new SocketIO(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:3001',
      'http://localhost:3000',
      'https://coderscup-scoreboard-2025.vercel.app',
      'https://coderscup-scoreboard-2025-raahims-projects-f828742c.vercel.app',
      'https://scoreboard.acmnuceskhi.com',
      'https://procom-cp-platform.vercel.app',
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ msg: "Coders cup scoreboard" });
});

app.use('/api', rankingRoutes(io));

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log('Connected and listening to requests on', PORT);
});