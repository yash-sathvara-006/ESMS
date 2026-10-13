import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { bootstrapDatabase } from './db/bootstrap';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*'
  })
);
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'ESMS Backend Server is running smoothly!',
    databaseProvider: process.env.DB_PROVIDER || 'sqlite',
    timestamp: new Date().toISOString()
  });
});

async function startServer() {
  // Ensure database has 10,000 seeded employees on startup
  await bootstrapDatabase();

  app.listen(PORT, () => {
    console.log(`🚀 Backend Server ready at: http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

export default app;
