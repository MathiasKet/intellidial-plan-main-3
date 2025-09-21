import winston from 'winston';
import path from 'path';
import 'winston-daily-rotate-file';
import { format } from 'winston';
import { TransformableInfo } from 'logform';

const { combine, timestamp, printf, colorize, json } = format;

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, ...meta }) => {
  return `${timestamp} [${level}]: ${message} ${
    Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
  }`;
});

// Custom format for file output
const fileFormat = printf(({ level, message, timestamp, ...meta }) => {
  const logEntry: Record<string, any> = {
    timestamp,
    level,
    message,
    ...meta,
  };
  return JSON.stringify(logEntry);
});

// Create logs directory if it doesn't exist
const logDir = path.join(process.cwd(), 'logs');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

// Create the logger instance
export const logger = winston.createLogger({
  levels,
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'ai-voice-caller' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        consoleFormat
      ),
    }),
    // Daily rotate file transport for errors
    new winston.transports.DailyRotateFile({
      level: 'error',
      dirname: path.join(logDir, 'error'),
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: combine(timestamp(), fileFormat),
    }),
    // Daily rotate file transport for all logs
    new winston.transports.DailyRotateFile({
      dirname: path.join(logDir, 'combined'),
      filename: 'combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: combine(timestamp(), fileFormat),
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log'),
    }),
  ],
  exitOnError: false,
});

// Create a stream for Morgan HTTP request logging
export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Handle uncaught exceptions and unhandled promise rejections
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Don't exit in development to allow for debugging
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in development to allow for debugging
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});
