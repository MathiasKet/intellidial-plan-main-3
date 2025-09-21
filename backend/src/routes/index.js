import { Router } from 'express';
import authRoutes from './auth.routes.js';
import callRoutes from './call.routes.js';
import crmRoutes from './crm.routes.js';
import calendarRoutes from './calendar.routes.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Public routes
router.use('/auth', authRoutes);

// Protected routes (require authentication)
router.use(authenticate);
router.use('/calls', callRoutes);
router.use('/crm', crmRoutes);
router.use('/calendar', calendarRoutes);

export default router;
