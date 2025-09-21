import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  initiateCall,
  handleIncomingCall,
  handleCallStatus,
  getCallHistory,
  getCallDetails,
  endCall,
} from '../controllers/call.controller.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// @route   POST /api/calls/initiate
// @desc    Initiate an outbound call
// @access  Private
router.post(
  '/initiate',
  authenticate,
  [
    body('to', 'Recipient number is required').not().isEmpty(),
    body('from', 'Caller ID is required').not().isEmpty(),
    body('message', 'Initial message is required').optional(),
  ],
  validateRequest,
  initiateCall
);

// @route   POST /api/calls/webhook/incoming
// @desc    Handle incoming call webhook from Twilio
// @access  Public (Twilio webhook)
router.post(
  '/webhook/incoming',
  [
    body('CallSid', 'CallSid is required').not().isEmpty(),
    body('From', 'From number is required').not().isEmpty(),
    body('To', 'To number is required').not().isEmpty(),
  ],
  validateRequest,
  handleIncomingCall
);

// @route   POST /api/calls/webhook/status
// @desc    Handle call status updates from Twilio
// @access  Public (Twilio webhook)
router.post(
  '/webhook/status',
  [
    body('CallSid', 'CallSid is required').not().isEmpty(),
    body('CallStatus', 'CallStatus is required').not().isEmpty(),
  ],
  validateRequest,
  handleCallStatus
);

// @route   GET /api/calls/history
// @desc    Get call history for authenticated user
// @access  Private
router.get('/history', authenticate, getCallHistory);

// @route   GET /api/calls/:callId
// @desc    Get call details by ID
// @access  Private
router.get(
  '/:callId',
  authenticate,
  [param('callId', 'Call ID is required').not().isEmpty()],
  validateRequest,
  getCallDetails
);

// @route   POST /api/calls/:callId/end
// @desc    End an active call
// @access  Private
router.post(
  '/:callId/end',
  authenticate,
  [param('callId', 'Call ID is required').not().isEmpty()],
  validateRequest,
  endCall
);

export default router;
