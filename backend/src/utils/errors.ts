export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

export class ValidationError extends AppError {
  errors: Record<string, string[]>;

  constructor(errors: Record<string, string[]>, message = 'Validation Error') {
    super(message, 400);
    this.errors = errors;
  }
}

export const errorHandler = (err: any, req: any, res: any, next: any) => {
  if (res.headersSent) {
    return next(err);
  }

  // Default to 500 if status code not set
  const statusCode = err.statusCode || 500;
  
  // In development, send the full error stack
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const response: any = {
    status: 'error',
    message: err.message || 'Internal Server Error',
  };

  if (err.errors) {
    response.errors = err.errors;
  }

  if (isDevelopment) {
    response.stack = err.stack;
  }

  // Log the error
  console.error(`[${new Date().toISOString()}] ${err.message}`, {
    status: statusCode,
    path: req.path,
    method: req.method,
    stack: isDevelopment ? err.stack : undefined,
  });

  res.status(statusCode).json(response);
};
