import { Request, Response, NextFunction } from 'express';
import twilio from 'twilio';
import { UnauthorizedError } from '../utils/errors';

// Middleware to validate that the request is coming from Twilio
export const validateTwilioRequest = (req: Request, res: Response, next: NextFunction) => {
  // Skip validation in development for testing
  if (process.env.NODE_ENV === 'development' && !process.env.TWILIO_AUTH_TOKEN) {
    return next();
  }

  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!authToken) {
    console.error('TWILIO_AUTH_TOKEN is not set');
    throw new Error('Server configuration error');
  }

  // Get the full URL of the request
  const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  
  // Get the X-Twilio-Signature header
  const signature = req.header('X-Twilio-Signature');
  
  if (!signature) {
    throw new UnauthorizedError('Missing Twilio signature');
  }

  // Validate the request
  const params = req.body;
  const isValid = twilio.validateRequest(
    authToken,
    signature,
    url,
    params
  );

  if (!isValid) {
    throw new UnauthorizedError('Invalid Twilio request signature');
  }

  next();
};

// Middleware to parse Twilio webhook request body
export const twilioWebhook = (req: Request, res: Response, next: NextFunction) => {
  // Twilio sends form data, so we need to parse it
  if (req.is('application/x-www-form-urlencoded')) {
    // The body-parser middleware has already parsed the form data
    // We just need to make sure the body is available
    if (!req.body) {
      throw new Error('Failed to parse Twilio webhook body');
    }
  }
  
  next();
};
