import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import connectDB from './config/db.js';
import authRouter from './routes/auth.js';
import analyzeRouter from './routes/analyze.js';
import { initSocket } from './socket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup environment variables relative to backend folder
const envPath = path.resolve(__dirname, '.env');
console.log(`[DEBUG] Attempting to load .env from: ${envPath}`);
dotenv.config({ path: envPath, override: true });
console.log('[DEBUG] GOOGLE_CLIENT_ID loaded in server.js:', process.env.GOOGLE_CLIENT_ID);
console.log(`[DEBUG] GROQ_API_KEY exists: ${!!process.env.GROQ_API_KEY}`);

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) return true;
  if (origin.endsWith('.vercel.app') || origin === 'https://speakspin-nine.vercel.app') return true;
  return false;
};

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api', analyzeRouter);

// Root entrypoint message
app.get('/', (req, res) => {
  res.json({
    status: "online",
    message: "SpeakSpin API Gateway - Socket & AI services operating successfully.",
    uptime: process.uptime(),
    health: "/health"
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Setup WebSockets and HTTP server wrapper
const httpServer = createServer(app);
initSocket(httpServer);

// Start Server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`SpeakSpin Backend server running on http://0.0.0.0:${PORT} (all interfaces) with Battle Mode sockets enabled`);
});
