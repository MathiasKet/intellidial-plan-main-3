import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/ApiError';

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error
  logger.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle unique constraint violation
    if (err.code === 'P2002') {
      const field = (err.meta?.target as string[])?.[0] || 'field';
      return res.status(400).json({
        status: 'error',
        message: `A record with this ${field} already exists`,
      });
    }

    // Handle record not found
    if (err.code === 'P2025') {
      return res.status(404).json({
        status: 'error',
        message: 'The requested resource was not found',
      });
    }
  }

  // Handle validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation error',
      details: err.message,
    });
  }

  // Handle our custom ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token expired',
    });
  }

  // Default error response
  const statusCode = 500;
  const message = process.env.NODE_ENV === 'development' 
    ? err.message 
    : 'Internal Server Error';

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
