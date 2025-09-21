import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/ApiError';

export const validateRequest = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Log validation errors
    logger.warn('Validation failed', {
      path: req.path,
      method: req.method,
      errors: errors.array(),
      body: req.body,
      params: req.params,
      query: req.query,
    });

    // Format errors
    const formattedErrors = errors.array().reduce((acc: Record<string, string>, err) => {
      if (err.type === 'field') {
        acc[err.path] = err.msg;
      } else {
        acc[err.type] = err.msg;
      }
      return acc;
    }, {});

    throw ApiError.badRequest('Validation failed', formattedErrors);
  };
};

// Helper function to validate UUID parameters
export const validateUUID = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const paramValue = req.params[paramName];
    
    if (!uuidRegex.test(paramValue)) {
      throw ApiError.badRequest(`Invalid ${paramName} format`);
    }
    
    next();
  };
};

// Helper function to validate pagination query parameters
export const validatePagination = [
  (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    
    if (page < 1) {
      throw ApiError.badRequest('Page must be greater than 0');
    }
    
    if (limit < 1 || limit > 100) {
      throw ApiError.badRequest('Limit must be between 1 and 100');
    }
    
    req.pagination = { page, limit };
    next();
  },
];
