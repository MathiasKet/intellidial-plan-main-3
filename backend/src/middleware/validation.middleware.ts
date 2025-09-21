import { validationResult } from 'express-validator';
import { NextFunction, Request, Response } from 'express';
import { ValidationError } from '../utils/errors';

export const validate = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors: Record<string, string[]> = {};
    errors.array().forEach(err => {
      const key = err.param;
      if (!extractedErrors[key]) {
        extractedErrors[key] = [];
      }
      extractedErrors[key].push(err.msg);
    });

    next(new ValidationError(extractedErrors));
  };
};
