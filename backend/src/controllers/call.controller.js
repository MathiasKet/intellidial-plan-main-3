import twilio from 'twilio';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../index.js';
import { logger } from '../utils/logger.js';
import { generateTwimlResponse } from '../services/twilio.service.js';

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * @desc    Initiate an outbound call
 * @route   POST /api/calls/initiate
 * @access  Private
 */
export const initiateCall = async (req, res) => {
  const { to, from, message } = req.body;
  const userId = req.user.id;

  try {
    // Create a new call record
    const callId = `call_${uuidv4()}`;
    const { data: call, error } = await supabase
      .from('calls')
      .insert([
        {
          id: callId,
          user_id: userId,
          from_number: from,
          to_number: to,
          status: 'initiated',
          direction: 'outbound',
          started_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      logger.error(`Failed to create call record: ${error.message}`);
      throw new Error('Failed to initiate call');
    }

    // Initiate the call using Twilio
    const twilioCall = await twilioClient.calls.create({
      twiml: generateTwimlResponse({
        message: message || 'Hello, this is an AI-powered call. How can I help you today?',
      }),
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
      statusCallback: `${process.env.API_URL}/api/calls/webhook/status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      statusCallbackMethod: 'POST',
    });

    // Update call with Twilio SID
    await supabase
      .from('calls')
      .update({
        external_id: twilioCall.sid,
        status: 'initiated',
      })
      .eq('id', callId);

    res.status(StatusCodes.CREATED).json({
      success: true,
      call: {
        id: callId,
        status: 'initiated',
        twilioSid: twilioCall.sid,
      },
    });
  } catch (error) {
    logger.error(`Call initiation error: ${error.message}`);
    
    // Update call status to failed
    await supabase
      .from('calls')
      .update({
        status: 'failed',
        ended_at: new Date().toISOString(),
        error: error.message,
      })
      .eq('id', callId);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to initiate call',
      error: error.message,
    });
  }
};

/**
 * @desc    Handle incoming call webhook
 * @route   POST /api/calls/webhook/incoming
 * @access  Public (Twilio webhook)
 */
export const handleIncomingCall = async (req, res) => {
  const { CallSid, From, To } = req.body;
  
  try {
    // Create a new call record for incoming call
    const callId = `call_${uuidv4()}`;
    await supabase.from('calls').insert([
      {
        id: callId,
        external_id: CallSid,
        from_number: From,
        to_number: To,
        status: 'ringing',
        direction: 'inbound',
        started_at: new Date().toISOString(),
      },
    ]);

    // Generate TwiML response
    const twiml = generateTwimlResponse({
      message: 'Thank you for calling. Please wait while we connect you to an available agent.',
    });

    // Send TwiML response to Twilio
    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    logger.error(`Incoming call error: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Error handling call');
  }
};

/**
 * @desc    Handle call status updates
 * @route   POST /api/calls/webhook/status
 * @access  Public (Twilio webhook)
 */
export const handleCallStatus = async (req, res) => {
  const { CallSid, CallStatus, CallDuration, RecordingUrl } = req.body;
  
  try {
    // Find the call in our database
    const { data: call, error } = await supabase
      .from('calls')
      .select('*')
      .eq('external_id', CallSid)
      .single();

    if (error) {
      logger.error(`Call status update error - CallSid ${CallSid}: ${error.message}`);
      return res.status(StatusCodes.NOT_FOUND).send('Call not found');
    }

    // Update call status
    const updates = {
      status: CallStatus.toLowerCase(),
      updated_at: new Date().toISOString(),
    };

    // If call is completed, set end time and duration
    if (CallStatus === 'completed') {
      updates.ended_at = new Date().toISOString();
      updates.duration = parseInt(CallDuration || '0', 10);
      updates.recording_url = RecordingUrl || null;
    }

    // Update call record
    await supabase
      .from('calls')
      .update(updates)
      .eq('external_id', CallSid);

    res.status(StatusCodes.OK).send('Call status updated');
  } catch (error) {
    logger.error(`Call status update error: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Error updating call status');
  }
};

/**
 * @desc    Get call history for authenticated user
 * @route   GET /api/calls/history
 * @access  Private
 */
export const getCallHistory = async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  
  try {
    let query = supabase
      .from('calls')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('started_at', { ascending: false })
      .range(offset, offset + parseInt(limit, 10) - 1);

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status.toLowerCase());
    }

    const { data: calls, count, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data: calls,
      pagination: {
        total: count,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    logger.error(`Get call history error: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve call history',
    });
  }
};

/**
 * @desc    Get call details by ID
 * @route   GET /api/calls/:callId
 * @access  Private
 */
export const getCallDetails = async (req, res) => {
  const { callId } = req.params;
  
  try {
    const { data: call, error } = await supabase
      .from('calls')
      .select('*')
      .eq('id', callId)
      .single();

    if (error || !call) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Call not found',
      });
    }

    // Check if the user is authorized to view this call
    if (call.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Not authorized to view this call',
      });
    }

    // Get call transcript if available
    let transcript = null;
    if (call.transcript_id) {
      const { data: transcriptData } = await supabase
        .from('transcripts')
        .select('*')
        .eq('id', call.transcript_id)
        .single();
      
      transcript = transcriptData;
    }

    res.json({
      success: true,
      data: {
        ...call,
        transcript,
      },
    });
  } catch (error) {
    logger.error(`Get call details error: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve call details',
    });
  }
};

/**
 * @desc    End an active call
 * @route   POST /api/calls/:callId/end
 * @access  Private
 */
export const endCall = async (req, res) => {
  const { callId } = req.params;
  
  try {
    // Get call details
    const { data: call, error: callError } = await supabase
      .from('calls')
      .select('*')
      .eq('id', callId)
      .single();

    if (callError || !call) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Call not found',
      });
    }

    // Check if the user is authorized to end this call
    if (call.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Not authorized to end this call',
      });
    }

    // If the call has a Twilio SID, end it through Twilio
    if (call.external_id) {
      await twilioClient.calls(call.external_id).update({ status: 'completed' });
    }

    // Update call status in database
    await supabase
      .from('calls')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString(),
      })
      .eq('id', callId);

    res.json({
      success: true,
      message: 'Call ended successfully',
    });
  } catch (error) {
    logger.error(`End call error: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to end call',
    });
  }
};
