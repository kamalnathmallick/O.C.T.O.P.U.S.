import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/authRoutes';
import machineRoutes from './routes/machineRoutes';
import sensorRoutes from './routes/sensorRoutes';
import alertRoutes from './routes/alertRoutes';
import predictionRoutes from './routes/predictionRoutes';
import maintenanceRoutes from './routes/maintenanceRoutes';
import userRoutes from './routes/userRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import systemRoutes from './routes/systemRoutes';
import agentRoutes from './routes/agentRoutes';

dotenv.config();

const app: Application = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Make Prisma available in requests
app.use((req: Request, res: Response, next: NextFunction) => {
  (req as any).prisma = prisma;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/agents', agentRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    database: (req.app.locals as any).dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = async () => {
  let dbConnected = false;
  try {
    await prisma.$connect();
    console.log('Connected to database');
    dbConnected = true;
  } catch (error) {
    console.error('Database connection failed. Server will start in degraded mode:', error);
  }

  (app.locals as any).dbConnected = dbConnected;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

export default app;
