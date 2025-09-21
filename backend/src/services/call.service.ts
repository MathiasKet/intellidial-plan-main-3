import { PrismaClient, Call, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { NotFoundError, BadRequestError } from '../utils/errors';

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

const prisma = new PrismaClient();

class CallService {
  async createCall(userId: string, callData: {
    fromNumber: string;
    toNumber: string;
    callSid?: string;
    sid?: string;
    status?: string;
  }): Promise<Call> {
    const call = await prisma.call.create({
      data: {
        id: uuidv4(),
        userId,
        status: (callData.status as CallStatus) || 'INITIATED',
        fromNumber: callData.fromNumber,
        toNumber: callData.toNumber,
        callSid: callData.callSid || callData.sid,
        startTime: new Date(),
        updatedAt: new Date(),
      },
    });

    // Log the call creation
    await this.logCallAction(call.id, userId, 'CALL_INITIATED', {
      from: callData.fromNumber,
      to: callData.toNumber,
    });

    return call;
  }

  async getCallById(callId: string, userId: string): Promise<Call> {
    const call = await prisma.call.findUnique({
      where: { id: callId },
    });

    if (!call) {
      throw new NotFoundError('Call not found');
    }

    // Ensure the user has access to this call
    if (call.userId !== userId) {
      throw new BadRequestError('Not authorized to access this call');
    }

    return call;
  }

  async updateCall(
    callId: string, 
    updateData: Prisma.CallUpdateInput,
    userId?: string
  ): Promise<Call> {
    // If userId is provided, verify the user has access to this call
    if (userId) {
      await this.getCallById(callId, userId);
    }

    const updatedCall = await prisma.call.update({
      where: { id: callId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    // Log the update if we have a user context
    if (userId) {
      await this.logCallAction(callId, userId, 'CALL_UPDATED', updateData);
    }

    return updatedCall;
  }

  async updateCallStatus(
    callId: string, 
    userId: string, 
    status: CallStatus,
    additionalData: Partial<Call> = {}
  ): Promise<Call> {
    // Get the call to verify access and get the start time
    const existingCall = await this.getCallById(callId, userId);
    
    const updateData: Prisma.CallUpdateInput = {
      status,
      updatedAt: new Date(),
      ...additionalData,
    };

    // Set end time if call is completed or failed
    if (['COMPLETED', 'FAILED', 'BUSY', 'NO_ANSWER', 'CANCELED'].includes(status)) {
      updateData.endTime = new Date();
      
      // Calculate duration if we have both start and end times
      if (existingCall.startTime) {
        const endTime = updateData.endTime as Date;
        const duration = Math.floor((endTime.getTime() - existingCall.startTime.getTime()) / 1000);
        updateData.duration = duration > 0 ? duration : 0;
      }
    }

    const updatedCall = await prisma.call.update({
      where: { id: callId },
      data: updateData,
    });

    // Log the status update
    await this.logCallAction(callId, userId, `STATUS_${status}`, {
      previousStatus: existingCall.status,
      newStatus: status,
      ...additionalData,
    });

    return updatedCall;
  }

  async saveCallRecording(callId: string, userId: string, recordingUrl: string): Promise<Call> {
    // Verify the user has access to the call
    await this.getCallById(callId, userId);
    
    return prisma.call.update({
      where: { id: callId },
      data: {
        recordingUrl,
        updatedAt: new Date(),
      },
    });
  }

  async getCallsByUser(userId: string, filters: {
    status?: CallStatus;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  } = {}): Promise<{ calls: Call[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.startDate || filters.endDate) {
      where.startTime = {};
      if (filters.startDate) where.startTime.gte = filters.startDate;
      if (filters.endDate) where.startTime.lte = filters.endDate;
    }

    const [calls, total] = await Promise.all([
      prisma.call.findMany({
        where,
        orderBy: { startTime: 'desc' },
        skip,
        take: limit,
      }),
      prisma.call.count({ where }),
    ]);

    return { calls, total };
  }

  private async logCallAction(
    callId: string,
    userId: string,
    action: string,
    details: Record<string, any>
  ): Promise<void> {
    try {
      await prisma.callLog.create({
        data: {
          id: uuidv4(),
          callId,
          userId,
          action,
          details: JSON.stringify(details),
          // createdAt is automatically set by Prisma with @default(now())
        },
      });
    } catch (error) {
      console.error('Error logging call action:', error);
      // Don't throw, as we don't want to fail the main operation
    }
  }

  async updateCallBySid(
    callSid: string, 
    updateData: Prisma.CallUpdateInput
  ): Promise<Call> {
    // Find the call by SID first
    const call = await prisma.call.findFirst({
      where: { callSid },
    });

    if (!call) {
      throw new NotFoundError(`Call with SID ${callSid} not found`);
    }

    // If status is a final status, set endTime and calculate duration
    if (updateData.status && ['COMPLETED', 'FAILED', 'BUSY', 'NO_ANSWER', 'CANCELED'].includes(updateData.status as string)) {
      updateData.endTime = new Date();
      if (call.startTime) {
        const endTime = updateData.endTime as Date;
        const duration = Math.floor((endTime.getTime() - call.startTime.getTime()) / 1000);
        updateData.duration = duration > 0 ? duration : 0;
      }
    }

    // Update the call
    const updatedCall = await prisma.call.update({
      where: { id: call.id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    // Log the update
    await this.logCallAction(call.id, call.userId, 'CALL_UPDATED_BY_SID', updateData);

    return updatedCall;
  }

  async getCallLogs(callId: string, userId: string) {
    // Verify the user has access to this call
    await this.getCallById(callId, userId);
    
    return prisma.callLog.findMany({
      where: { callId },
      orderBy: { createdAt: 'asc' },
    });
  }
}

export default new CallService();
