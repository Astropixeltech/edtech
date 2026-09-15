import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for Vite frontend
app.use(
  cors({
    origin: ['http://localhost:8088', 'http://127.0.0.1:8088', 'http://localhost:5173'],
    credentials: true,
  })
);

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'Astropixel Learn Node.js/Express API', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`🚀 Astropixel Learn Express API Server running on http://localhost:${PORT}`);
});
