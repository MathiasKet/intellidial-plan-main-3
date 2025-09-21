import { Request, Response, NextFunction } from 'express';
import callService from '../services/call.service';
import twilioService from '../services/twilio.service';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { body } from 'express-validator';
import { NotFoundError, BadRequestError } from '../utils/errors';

class CallController {
  async initiateCall(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { toNumber, fromNumber } = req.body;

      // Validate phone numbers
      if (!toNumber) {
        throw new BadRequestError('Recipient number is required');
      }

      // Use Twilio to initiate the call
      const result = await twilioService.makeCall(
        userId,
        toNumber,
        fromNumber
      );

      res.status(201).json({
        status: 'success',
        data: {
          callId: result.callId,
          callSid: result.callSid,
          status: result.status,
        },
      });
    } catch (error) {
      console.error('Error initiating call:', error);
      next(error);
    }
  }

  async getCallDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { callId } = req.params;

      const call = await callService.getCallById(callId, userId);

      res.status(200).json({
        status: 'success',
        data: {
          call,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCallStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { callId } = req.params;
      const { status, ...additionalData } = req.body;

      if (!status) {
        throw new Error('Status is required');
      }

      const call = await callService.updateCallStatus(
        callId,
        userId,
        status,
        additionalData
      );

      res.status(200).json({
        status: 'success',
        data: {
          call,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCallLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { callId } = req.params;

      const logs = await callService.getCallLogs(callId, userId);

      res.status(200).json({
        status: 'success',
        data: {
          logs: logs.map(log => ({
            ...log,
            details: log.details ? JSON.parse(log.details as string) : null,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserCalls(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { status, startDate, endDate, page = 1, limit = 10 } = req.query;

      const { calls, total } = await callService.getCallsByUser(userId, {
        status: status as any,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        page: Number(page),
        limit: Number(limit),
      });

      res.status(200).json({
        status: 'success',
        data: {
          calls,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Webhook handler for call status updates from the telephony provider
  async handleCallWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      // This would be implemented based on your telephony provider's webhook format
      // For example, with Twilio, you'd get a CallSid and CallStatus
      const { CallSid, CallStatus, ...otherParams } = req.body;

      if (!CallSid) {
        throw new Error('Missing CallSid in webhook payload');
      }

      // In a real implementation, you would:
      // 1. Find the call by CallSid (stored as callSid in our database)
      // 2. Update the call status based on the webhook data
      // 3. Store any additional data (like recording URLs, call duration, etc.)

      // For now, we'll just acknowledge the webhook
      res.status(200).json({
        status: 'success',
        message: 'Webhook received',
        data: {
          callSid: CallSid,
          callStatus: CallStatus,
          receivedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error processing call webhook:', error);
      next(error);
    }
  }
}

export default new CallController();
