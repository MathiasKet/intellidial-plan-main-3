import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { UnauthorizedError } from '../utils/errors';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;
    
    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Get token from cookie
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new UnauthorizedError('Not authorized to access this route');
    }

    try {
      // Verify token
      const secret = process.env.JWT_SECRET || 'your-secret-key';
      const decoded: any = jwt.verify(token, secret);

      // Get user from the token
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new UnauthorizedError('User account is deactivated');
      }

      // Add user to request
      (req as any).user = user;
      next();
    } catch (error) {
      throw new UnauthorizedError('Not authorized, token failed');
    }
  } catch (error) {
    next(error);
  }
};

// Grant access to specific roles
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!roles.includes((req as any).user.role)) {
        throw new UnauthorizedError(
          `User role ${(req as any).user.role} is not authorized to access this route`
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
