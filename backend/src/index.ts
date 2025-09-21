import 'dotenv/config';
import { app } from './app';
import { prisma } from './app';
import { logger } from './utils/logger';
import { Server } from 'http';

const PORT = process.env.PORT || 4000; // Changed default port to 4000

// Function to start the server
const startServer = (port: number): Promise<Server> => {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      resolve(server);
    });

    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        logger.warn(`Port ${port} is already in use, trying port ${port + 1}`);
        startServer(port + 1).then(resolve).catch(reject);
      } else {
        logger.error('Failed to start server:', error);
        reject(error);
      }
    });
  });
};

// Start the server
startServer(Number(PORT))
  .then((server: Server) => {
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err: Error) => {
      logger.error(`Unhandled Rejection: ${err.message}`);
      // Close server & exit process
      server.close(() => process.exit(1));
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err: Error) => {
      logger.error(`Uncaught Exception: ${err.message}`);
      // Close server & exit process
      server.close(() => process.exit(1));
    });

    // Handle SIGTERM
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        logger.info('Process terminated.');
        process.exit(0);
      });
    });
  })
  .catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });

// Handle SIGINT
process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  prisma.$disconnect()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Error disconnecting from database:', error);
      process.exit(1);
    });
});
