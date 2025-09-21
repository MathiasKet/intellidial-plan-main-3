import { validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';

/**
 * Middleware to validate request using express-validator
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  
  next();
};

/**
 * Middleware to validate file uploads
 */
export const validateFile = (fieldName, allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']) => {
  return (req, res, next) => {
    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `No file uploaded for ${fieldName}`,
      });
    }

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      });
    }

    next();
  };
};

/**
 * Middleware to validate file size
 */
export const validateFileSize = (maxSizeInMB) => {
  const maxSize = maxSizeInMB * 1024 * 1024; // Convert MB to bytes
  
  return (req, res, next) => {
    if (req.file && req.file.size > maxSize) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `File size exceeds the maximum limit of ${maxSizeInMB}MB`,
      });
    }
    
    next();
  };
};
