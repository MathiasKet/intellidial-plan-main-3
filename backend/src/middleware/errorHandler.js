import { StatusCodes } from 'http-status-codes';
import { logger } from '../utils/logger.js';

/**
 * Error response middleware for 404 not found.
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(StatusCodes.NOT_FOUND);
  next(error);
};

/**
 * Error response middleware for handling all errors.
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? StatusCodes.INTERNAL_SERVER_ERROR : res.statusCode;
  
  // Log the error for debugging
  logger.error({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
  });

  // Don't leak stack traces in production
  const errorResponse = {
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    errorResponse.message = 'Invalid token';
    return res.status(StatusCodes.UNAUTHORIZED).json(errorResponse);
  }

  // Handle JWT expired error
  if (err.name === 'TokenExpiredError') {
    errorResponse.message = 'Token expired';
    return res.status(StatusCodes.UNAUTHORIZED).json(errorResponse);
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    errorResponse.message = 'Validation Error';
    errorResponse.errors = err.errors;
    return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
  }

  // Handle duplicate key errors
  if (err.code === '23505') {
    errorResponse.message = 'Duplicate key error';
    return res.status(StatusCodes.CONFLICT).json(errorResponse);
  }

  // Handle other errors
  res.status(statusCode).json(errorResponse);
};

export default errorHandler;
