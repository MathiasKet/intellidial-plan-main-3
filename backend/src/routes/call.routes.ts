import { Router } from 'express';
import callController from '../controllers/call.controller';
import { protect } from '../middleware/auth.middleware';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware';

const callRouter = Router();

// Apply auth middleware to all routes
callRouter.use(protect);

// Call management routes
callRouter.post(
  '/initiate',
  [
    body('toNumber').notEmpty().withMessage('Recipient number is required'),
    body('fromNumber').notEmpty().withMessage('Caller ID number is required'),
  ],
  validate,
  callController.initiateCall
);

callRouter.get('/:callId', callController.getCallDetails);
callRouter.put(
  '/:callId/status',
  [
    body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isIn([
        'QUEUED',
        'RINGING',
        'IN_PROGRESS',
        'COMPLETED',
        'BUSY',
        'FAILED',
        'NO_ANSWER',
        'CANCELED',
      ])
      .withMessage('Invalid status'),
  ],
  validate,
  callController.updateCallStatus
);

callRouter.get('/:callId/logs', callController.getCallLogs);
callRouter.get('/', callController.getUserCalls);

// Webhook endpoint for call status updates (no auth required)
callRouter.post('/webhook', callController.handleCallWebhook);

// Export the router as default
export default callRouter;
