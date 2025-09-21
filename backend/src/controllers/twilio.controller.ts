import { Request, Response, NextFunction } from 'express';
import twilio from 'twilio';
import twilioService from '../services/twilio.service';
import callService from '../services/call.service';
import { BadRequestError } from '../utils/errors';

class TwilioController {
  // Handle incoming call webhook from Twilio
  async handleIncomingCall(req: Request, res: Response, next: NextFunction) {
    try {
      const { To, From, CallSid } = req.body;
      
      if (!To || !From || !CallSid) {
        throw new BadRequestError('Missing required parameters');
      }

      // Generate TwiML response for the call
      const twiml = await twilioService.handleIncomingCall(To, From, CallSid);
      
      // Set the content type to XML
      res.type('text/xml');
      res.send(twiml);
    } catch (error) {
      next(error);
    }
  }

  // Handle call status updates from Twilio
  async handleStatusUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const { CallSid, CallStatus, CallDuration } = req.body;
      
      if (!CallSid || !CallStatus) {
        throw new BadRequestError('Missing required parameters');
      }

      await twilioService.handleStatusUpdate(
        CallSid,
        CallStatus,
        CallDuration ? parseInt(CallDuration) : undefined
      );

      res.status(200).json({ status: 'success' });
    } catch (error) {
      console.error('Error processing status update:', error);
      next(error);
    }
  }

  // Handle call initiation (when the call is first answered)
  async handleCallInitiation(req: Request, res: Response, next: NextFunction) {
    try {
      const { CallSid, To, From } = req.body;
      
      if (!CallSid || !To || !From) {
        throw new BadRequestError('Missing required parameters');
      }

      // Generate TwiML to handle the call
      const twiml = new twilio.twiml.VoiceResponse();
      
      // Example: Play a welcome message and then connect to an agent
      twiml.say('Thank you for calling. Please wait while we connect you to an available agent.');
      
      // You can customize this based on your requirements
      // For example, you could use <Dial> to connect to a phone number
      // or <Enqueue> to put the call in a queue
      twiml.dial({
        action: `${process.env.APP_URL}/api/twilio/call/status`,
        method: 'POST',
        record: 'record-from-answer',
        recordingStatusCallback: `${process.env.APP_URL}/api/twilio/recording/status`,
      }, process.env.AGENT_PHONE_NUMBER || '');
      
      // Set the content type to XML
      res.type('text/xml');
      res.send(twiml.toString());
    } catch (error) {
      console.error('Error processing call initiation:', error);
      next(error);
    }
  }

  // Handle recording status updates
  async handleRecordingStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { CallSid, RecordingUrl, RecordingStatus, RecordingDuration } = req.body;
      
      if (!CallSid || !RecordingStatus) {
        throw new BadRequestError('Missing required parameters');
      }

      if (RecordingStatus === 'completed' && RecordingUrl) {
        // First update the call status to indicate recording is available
        await twilioService.handleStatusUpdate(CallSid, 'RECORDING_AVAILABLE');
        
        // Then update the call with the recording details
        const duration = RecordingDuration ? parseInt(RecordingDuration, 10) : 0;
        await callService.updateCallBySid(CallSid, 'RECORDING_AVAILABLE', {
          recordingUrl: RecordingUrl,
          recordingDuration: duration,
        });
      }

      res.status(200).json({ status: 'success' });
    } catch (error) {
      console.error('Error processing recording status:', error);
      next(error);
    }
  }
}

export default new TwilioController();
