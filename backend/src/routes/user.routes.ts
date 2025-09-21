import { Router } from 'express';
import userController from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  registerValidation,
  loginValidation,
  updateProfileValidation,
} from '../validations/user.validations';

const router = Router();

// Public routes
router.post('/register', validate(registerValidation), userController.register);
router.post('/login', validate(loginValidation), userController.login);

// Protected routes (require authentication)
router.use(protect);

// User profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', validate(updateProfileValidation), userController.updateProfile);
router.delete('/profile', userController.deleteProfile);

export default router;
