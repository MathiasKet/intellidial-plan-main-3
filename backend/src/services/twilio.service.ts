import Twilio from 'twilio';
import callService from './call.service';

// Define call status types for better type safety
type TwilioCallStatus = 
  | 'queued' 
  | 'ringing' 
  | 'in-progress' 
  | 'completed' 
  | 'busy' 
  | 'failed' 
  | 'no-answer' 
  | 'canceled';

type CallStatus = 
  | 'INITIATED' 
  | 'QUEUED' 
  | 'RINGING' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'MISSED' 
  | 'NO_ANSWER' 
  | 'BUSY' 
  | 'CANCELED'
  | 'RECORDING_AVAILABLE';

class TwilioService {
  private client: Twilio.Twilio | null = null;
  private accountSid: string;
  private authToken: string;
  private phoneNumber: string;
  private webhookBaseUrl: string;
  private isEnabled: boolean;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER || '';
    this.webhookBaseUrl = process.env.APP_URL || 'http://localhost:3000';
    this.isEnabled = !!(this.accountSid && this.authToken && this.phoneNumber);

    if (this.isEnabled) {
      try {
        this.client = Twilio(this.accountSid, this.authToken);
      } catch (error) {
        console.warn('Failed to initialize Twilio client:', error);
        this.isEnabled = false;
      }
    }
  }

  async makeCall(userId: string, toNumber: string, fromNumber: string) {
    try {
      const call = await callService.createCall(userId, {
        fromNumber,
        toNumber,
      });

      if (!this.isEnabled || !this.client) {
        console.warn('Twilio is not configured. Call not actually made.');
        // Return a mock call ID for development
        return call;
      }

      // Then initiate the call through Twilio
      const twilioCall = await this.client.calls.create({
        url: `${this.webhookBaseUrl}/api/calls/webhook/initiate`,
        to: toNumber,
        from: fromNumber || this.phoneNumber,
        statusCallback: `${this.webhookBaseUrl}/api/calls/webhook/status`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallbackMethod: 'POST',
      });

      // Update the call with the Twilio SID
      return await callService.updateCall(call.id, {
        callSid: twilioCall.sid,
        status: twilioCall.status.toUpperCase() as CallStatus,
      });
    } catch (error) {
      console.error('Error making call:', error);
      throw new Error('Failed to initiate call');
    }
  }

  async handleIncomingCall(to: string, from: string, callSid: string) {
    try {
      // For incoming calls, we might want to create a call record
      // or look up an existing one based on your business logic
      const call = await callService.createCall('system', {
        fromNumber: from,
        toNumber: to,
        sid: callSid,
        status: 'in-progress',
      });

      if (!this.isEnabled || !this.client) {
        console.warn('Twilio is not configured. Incoming call not processed.');
        return call;
      }

      // In a real app, you might want to look up the user based on the 'to' number
      // and apply any business logic for incoming calls
      return call;
    } catch (error) {
      console.error('Error handling incoming call:', error);
      throw new Error('Failed to handle incoming call');
    }
  }

  async handleStatusUpdate(callSid: string, callStatus: TwilioCallStatus, callDuration?: number) {
    try {
      const statusMap: Record<TwilioCallStatus, CallStatus> = {
        'queued': 'QUEUED',
        'ringing': 'RINGING',
        'in-progress': 'IN_PROGRESS',
        'completed': 'COMPLETED',
        'busy': 'BUSY',
        'failed': 'FAILED',
        'no-answer': 'NO_ANSWER',
        'canceled': 'CANCELED',
      };

      const status = statusMap[callStatus] || 'FAILED';
      const isFinalStatus = ['COMPLETED', 'BUSY', 'FAILED', 'NO_ANSWER', 'CANCELED'].includes(status);
      
      // Update the call status in the database
      const updateData: any = {
        status,
      };

      // Only update duration and endedAt for final statuses
      if (isFinalStatus) {
        updateData.endedAt = new Date();
        if (callDuration) {
          updateData.duration = callDuration;
        }
      }

      return await callService.updateCallBySid(callSid, updateData);
    } catch (error) {
      console.error('Error updating call status:', error);
      throw new Error('Failed to update call status');
    }
  }

  // Generate TwiML for handling the call
  // This is used when Twilio makes a request to your webhook URL
  getCallTwiml(options: {
    sayMessage?: string;
    dialNumber?: string;
    record?: boolean;
  } = {}): string {
    const { sayMessage = 'Hello! This is a call from our application.', dialNumber, record = false } = options;
    const dialNumberToUse = dialNumber || this.phoneNumber || '+1234567890';
    
    let twiml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    twiml += '<Response>\n';
    
    if (sayMessage) {
      twiml += `  <Say>${sayMessage}</Say>\n`;
    }
    
    if (dialNumberToUse) {
      twiml += '  <Dial';
      if (record) {
        twiml += ' record="record-from-answer"';
      }
      twiml += `>${dialNumberToUse}</Dial>\n`;
    }
    
    twiml += '</Response>';
    
    return twiml;
  }

  // Generate error TwiML
  getErrorTwiml(message: string): string {
    return `
      <Response>
        <Say>Sorry, an error occurred: ${message}</Say>
        <Hangup />
      </Response>
    `;
  }

  async sendSMS(to: string, body: string) {
    if (!this.isEnabled || !this.client) {
      console.warn('Twilio is not configured. SMS not sent.');
      return { 
        sid: 'mock_sms_' + Math.random().toString(36).substr(2, 9),
        status: 'sent',
        to,
        from: this.phoneNumber || 'mock_number',
        body,
      };
    }

    try {
      return await this.client.messages.create({
        body,
        to,
        from: this.phoneNumber,
      });
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw new Error('Failed to send SMS');
    }
  }
}

// Export a singleton instance
export default new TwilioService();
