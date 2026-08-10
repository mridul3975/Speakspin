import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRouter from './routes/auth.js';
import analyzeRouter from './routes/analyze.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup environment variables relative to backend folder
const envPath = path.resolve(__dirname, '.env');
console.log(`[DEBUG] Attempting to load .env from: ${envPath}`);
dotenv.config({ path: envPath, override: true });
console.log(`[DEBUG] GROQ_API_KEY exists: ${!!process.env.GROQ_API_KEY}`);
if (process.env.GROQ_API_KEY) {
  console.log(`[DEBUG] GROQ_API_KEY prefix: ${process.env.GROQ_API_KEY.substring(0, 7)}...`);
}

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api', analyzeRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start Server
app.listen(PORT, () => {
  console.log(`SpeakSpin Backend server running on port ${PORT}`);
});
