import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, refreshToken, logout } from '../controllers/auth.controller.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({
      min: 6,
    }),
    body('name', 'Name is required').not().isEmpty(),
    body('phone', 'Phone number is required').not().isEmpty(),
  ],
  validateRequest,
  register
);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists(),
  ],
  validateRequest,
  login
);

// @route   POST /api/auth/refresh-token
// @desc    Refresh access token
// @access  Public
router.post(
  '/refresh-token',
  [body('refreshToken', 'Refresh token is required').not().isEmpty()],
  validateRequest,
  refreshToken
);

// @route   POST /api/auth/logout
// @desc    Logout user (invalidate refresh token)
// @access  Private
router.post('/logout', logout);

export default router;
