import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { connectDB } from './config/db';
import { initSocket } from './socket/io';
import assignmentsRouter from './routes/assignments';
import generateRouter from './routes/generate';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  })
);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'vedaai-backend' });
});

app.use('/api/assignments', assignmentsRouter);
app.use('/api', generateRouter);

const server = http.createServer(app);

async function start() {
  await connectDB();
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`VedaAI API server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
