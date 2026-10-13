import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { bootstrapDatabase } from './db/bootstrap';
import apiRoutes from './routes';
import { errorHandler } from './middlewares/error.middleware';

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

// Mount All REST API Routes
app.use('/api', apiRoutes);

// Global Centralized Error Handler
app.use(errorHandler);

async function startServer() {
  // Ensure database has 10,000 seeded employees on startup
  await bootstrapDatabase();

  app.listen(PORT, () => {
    console.log(`🚀 Backend Server ready at: http://localhost:${PORT}`);
  });
}

// Only start listener if executed directly (not when imported in tests)
if (process.env.NODE_ENV !== 'test') {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
  });
}

export default app;
