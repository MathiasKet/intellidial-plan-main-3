import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const authRouter = Router();

// Register a new user
authRouter.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/[a-z]/)
      .withMessage('Password must contain at least one lowercase letter')
      .matches(/\d/)
      .withMessage('Password must contain at least one number'),
    body('phone').optional().isMobilePhone('any').withMessage('Valid phone number is required'),
  ],
  validateRequest,
  authController.register
);

// Login user
authRouter.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  authController.login
);

// Get current user
authRouter.get('/me', authenticate, authController.getCurrentUser);

// Refresh access token
authRouter.post('/refresh-token', [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  validateRequest,
  authController.refreshToken,
]);

// Logout user
authRouter.post('/logout', authenticate, authController.logout);

// Forgot password
authRouter.post(
  '/forgot-password',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  ],
  validateRequest,
  authController.forgotPassword
);

// Reset password
authRouter.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/[a-z]/)
      .withMessage('Password must contain at least one lowercase letter')
      .matches(/\d/)
      .withMessage('Password must contain at least one number'),
  ],
  validateRequest,
  authController.resetPassword
);

// Export the router as default
export default authRouter;
