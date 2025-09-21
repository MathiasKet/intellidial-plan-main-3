import twilio from 'twilio';
import { logger } from '../utils/logger.js';

const VoiceResponse = twilio.twiml.VoiceResponse;

/**
 * Generate TwiML response for Twilio
 * @param {Object} options - Options for the TwiML response
 * @param {string} options.message - The message to speak
 * @param {string} options.voice - The voice to use (default: 'Polly.Joanna')
 * @param {string} options.language - The language code (default: 'en-US')
 * @returns {string} TwiML XML string
 */
export const generateTwimlResponse = ({
  message = 'Hello, this is an AI-powered call. How can I help you today?',
  voice = 'Polly.Joanna',
  language = 'en-US',
}) => {
  try {
    const twiml = new VoiceResponse();
    
    // Use <Say> to convert text to speech
    twiml.say({
      voice,
      language,
    }, message);
    
    // Add a short pause
    twiml.pause({ length: 1 });
    
    // Add a prompt for the user to speak
    twiml.say({
      voice,
      language,
    }, 'Please speak after the beep. Press any key or stay silent to end the call.');
    
    // Record the user's voice
    twiml.record({
      action: '/api/calls/transcribe',
      method: 'POST',
      maxLength: 30, // Max recording length in seconds
      finishOnKey: '*', // End recording when * is pressed
      playBeep: true,
      timeout: 5, // Max silence before ending recording
    });
    
    // If no input, end the call
    twiml.say('We didn\'t hear anything. Goodbye!');
    twiml.hangup();
    
    return twiml.toString();
  } catch (error) {
    logger.error(`Error generating TwiML: ${error.message}`);
    // Return a simple error response
    const twiml = new VoiceResponse();
    twiml.say('Sorry, we encountered an error. Please try again later.');
    twiml.hangup();
    return twiml.toString();
  }
};

/**
 * Handle call recording callback
 * @param {Object} recording - Recording details from Twilio
 * @param {string} callSid - The call SID
 * @returns {Promise<void>}
 */
export const handleRecordingCallback = async (recording, callSid) => {
  try {
    const { RecordingUrl, RecordingSid, RecordingStatus } = recording;
    
    if (RecordingStatus !== 'completed') {
      logger.warn(`Recording ${RecordingSid} status: ${RecordingStatus}`);
      return;
    }
    
    // Here you would typically:
    // 1. Download the recording
    // 2. Transcribe it using a service like OpenAI Whisper
    // 3. Process the transcription
    // 4. Generate a response
    // 5. Update the call with the transcription
    
    logger.info(`Recording available at: ${RecordingUrl}`);
    
  } catch (error) {
    logger.error(`Error handling recording callback: ${error.message}`);
    throw error;
  }
};

/**
 * Send an SMS message using Twilio
 * @param {string} to - The recipient's phone number
 * @param {string} body - The message body
 * @param {string} from - The sender's phone number (default: TWILIO_PHONE_NUMBER)
 * @returns {Promise<Object>} The Twilio message SID
 */
export const sendSms = async (to, body, from = process.env.TWILIO_PHONE_NUMBER) => {
  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const message = await client.messages.create({
      body,
      to,
      from,
    });
    
    logger.info(`SMS sent to ${to}. SID: ${message.sid}`);
    return { success: true, sid: message.sid };
  } catch (error) {
    logger.error(`Error sending SMS: ${error.message}`);
    throw error;
  }
};
