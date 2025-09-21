import { Router, Request, Response, NextFunction } from 'express';
import { body, query, param } from 'express-validator';
import { Prisma } from '@prisma/client';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { prisma } from '../app';
import { logger } from '../utils/logger';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

// Type for the request handler with authenticated user
type AuthenticatedRequestHandler = (
  req: Request & { user: NonNullable<Request['user']> },
  res: Response,
  next: NextFunction
) => Promise<Response | void> | Response | void;

const crmRouter = Router();

// Apply auth middleware to all routes
crmRouter.use(protect);

/**
 * @swagger
 * /api/crm/logs:
 *   get:
 *     summary: Get all CRM logs with optional filtering
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *         description: Filter by entity type (lead, contact, deal)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status (success, failed)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by end date
 *     responses:
 *       200:
 *         description: List of CRM logs
 */
crmRouter.get(
  '/logs',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('entityType').optional().isString().trim(),
    query('status').optional().isString().trim(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        entityType, 
        status, 
        startDate, 
        endDate 
      } = req.query as {
        page?: number;
        limit?: number;
        entityType?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
      };

      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const where: any = { userId: req.user.id };

      if (entityType) where.entityType = entityType;
      if (status) where.status = status;
      
      if (startDate || endDate) {
        where.syncedAt = {};
        if (startDate) where.syncedAt.gte = new Date(startDate);
        if (endDate) where.syncedAt.lte = new Date(endDate);
      }

      const [total, logs] = await Promise.all([
        prisma.cRMLog.count({ where }),
        prisma.cRMLog.findMany({
          where,
          include: {
            call: {
              select: {
                id: true,
                fromNumber: true,
                toNumber: true,
                status: true,
                startTime: true,
              },
            },
          },
          orderBy: { syncedAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      res.json({
        data: logs,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      logger.error('Failed to fetch CRM logs', { error });
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/crm/logs/{id}:
 *   get:
 *     summary: Get a single CRM log by ID
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: CRM log ID
 *     responses:
 *       200:
 *         description: CRM log details
 *       404:
 *         description: CRM log not found
 */
crmRouter.get(
  '/logs/:id',
  [param('id').isUUID(), validate],
  async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const { id } = req.params;
      const log = await prisma.cRMLog.findUnique({
        where: { id, userId: req.user.id },
        include: {
          call: {
            select: {
              id: true,
              fromNumber: true,
              toNumber: true,
              status: true,
              startTime: true,
              endTime: true,
              duration: true,
            },
          },
        },
      });

      if (!log) {
        return res.status(404).json({ message: 'CRM log not found' });
      }

      res.json(log);
    } catch (error) {
      logger.error('Failed to fetch CRM log', { error });
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/crm/sync:
 *   post:
 *     summary: Manually trigger CRM sync for a call
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - callId
 *             properties:
 *               callId:
 *                 type: string
 *                 description: ID of the call to sync
 *               entityType:
 *                 type: string
 *                 enum: [lead, contact, deal]
 *                 description: Type of CRM entity to sync with
 *     responses:
 *       200:
 *         description: Sync initiated successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Call not found
 */
crmRouter.post(
  '/sync',
  [
    body('callId').isUUID(),
    body('entityType').optional().isIn(['lead', 'contact', 'deal']),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const { callId, entityType } = req.body;
      const userId = req.user.id;

      // Verify the call exists and belongs to the user
      const call = await prisma.call.findUnique({
        where: { id: callId, userId },
      });

      if (!call) {
        return res.status(404).json({ message: 'Call not found' });
      }

      // In a real implementation, this would call your CRM service
      // For now, we'll just create a log entry
      const crmLog = await prisma.cRMLog.create({
        data: {
          callId,
          userId,
          crmId: `crm-${Date.now()}`,
          entityType: entityType || 'lead',
          action: 'sync',
          status: 'success',
          metadata: JSON.stringify({
            callId,
            syncedAt: new Date().toISOString(),
            notes: 'Manual sync triggered',
          }),
        },
      });

      // TODO: In a real implementation, call your CRM service here
      // await crmService.syncCallWithCRM(call, entityType);

      res.json({
        message: 'CRM sync initiated',
        log: crmLog,
      });
    } catch (error) {
      logger.error('Failed to initiate CRM sync', { error });
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/crm/analytics:
 *   get:
 *     summary: Get CRM analytics
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for analytics
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for analytics
 *     responses:
 *       200:
 *         description: CRM analytics data
 */
crmRouter.get(
  '/analytics',
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { startDate, endDate } = req.query as {
        startDate?: string;
        endDate?: string;
      };

      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const where: any = { userId: req.user.id };
      
      if (startDate || endDate) {
        where.syncedAt = {};
        if (startDate) where.syncedAt.gte = new Date(startDate);
        if (endDate) where.syncedAt.lte = new Date(endDate);
      }

      const [totalLogs, byEntityType, byStatus, byDay] = await Promise.all([
        // Total logs
        prisma.cRMLog.count({ where }),
        
        // Group by entity type
        prisma.cRMLog.groupBy({
          by: ['entityType'],
          where,
          _count: true,
        }),
        
        // Group by status
        prisma.cRMLog.groupBy({
          by: ['status'],
          where,
          _count: true,
        }),
        
        // Group by day
        prisma.$queryRaw`
          SELECT 
            DATE(synced_at) as date, 
            COUNT(*) as count
          FROM "CRMLog"
          WHERE "userId" = ${req.user.id}
            ${startDate ? Prisma.sql`AND "syncedAt" >= ${new Date(startDate)}` : Prisma.empty}
            ${endDate ? Prisma.sql`AND "syncedAt" <= ${new Date(endDate)}` : Prisma.empty}
          GROUP BY DATE(synced_at)
          ORDER BY date DESC
          LIMIT 30
        `,
      ]);

      res.json({
        total: totalLogs,
        byEntityType: byEntityType.reduce((acc, curr) => ({
          ...acc,
          [curr.entityType]: curr._count,
        }), {}),
        byStatus: byStatus.reduce((acc, curr) => ({
          ...acc,
          [curr.status]: curr._count,
        }), {}),
        byDay,
      });
    } catch (error) {
      logger.error('Failed to fetch CRM analytics', { error });
      next(error);
    }
  }
);

// Export the router as default
export default crmRouter;
