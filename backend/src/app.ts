import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { errorHandler } from './middleware/errorHandler';
import authRouter from './routes/auth.routes';
import callRouter from './routes/call.routes';
import crmRouter from './routes/crm.routes';
import appointmentRouter from './routes/appointment.routes';
import twilioRouter from './routes/twilio.routes';
import { logger } from './utils/logger';

// Initialize Prisma Client
export const prisma = new PrismaClient();

// Create Express application
const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = ['http://localhost:8081', 'http://localhost:5173'];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/calls', callRouter);
app.use('/api/crm', crmRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/twilio', twilioRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Not Found',
    path: req.path
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

export { app };

// Start the server if this file is run directly
const startServer = (port?: number) => {
  const PORT = port || process.env.PORT || 3001; // Changed default port to 3001
  const server = app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
  
  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      logger.warn(`Port ${PORT} is already in use, trying port ${Number(PORT) + 1}`);
      startServer(Number(PORT) + 1);
    } else {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  });
  
  return server;
};

// Only start the server if this file is run directly (not imported)
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { startServer };
