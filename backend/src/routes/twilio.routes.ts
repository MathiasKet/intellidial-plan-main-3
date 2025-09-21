import { Router } from 'express';
import twilioController from '../controllers/twilio.controller';
import { validateTwilioRequest, twilioWebhook } from '../middleware/twilio.middleware';

const router = Router();

// Webhook for incoming calls
router.post('/incoming', twilioWebhook, validateTwilioRequest, twilioController.handleIncomingCall);

// Webhook for call status updates
router.post('/status', twilioWebhook, validateTwilioRequest, twilioController.handleStatusUpdate);

// Webhook for call initiation (when call is answered)
router.post('/call/initiate', twilioWebhook, validateTwilioRequest, twilioController.handleCallInitiation);

// Webhook for recording status updates
router.post('/recording/status', twilioWebhook, validateTwilioRequest, twilioController.handleRecordingStatus);

export default router;
