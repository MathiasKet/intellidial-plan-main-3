import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';

const appointmentRouter = Router();

// Apply auth middleware to all routes
appointmentRouter.use(protect);

// TODO: Implement appointment routes
appointmentRouter.get('/', (req, res) => {
  res.json({ message: 'Appointment routes will be implemented here' });
});

// Export the router as default
export default appointmentRouter;
