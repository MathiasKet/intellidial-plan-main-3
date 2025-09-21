import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../app';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/ApiError';

// Generate JWT token
const generateToken = (userId: string, expiresIn: string = '1h'): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn } as jwt.SignOptions
  );
};

// Generate refresh token
const generateRefreshToken = (userId: string) => {
  return jwt.sign(
    { userId, tokenId: uuidv4() },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET! + '_REFRESH',
    { expiresIn: '7d' }
  );
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw ApiError.conflict('Email already in use');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash: hashedPassword,
        role: 'USER', // Default role
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Set HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    logger.info(`User registered: ${user.email}`);

    res.status(201).json({
      status: 'success',
      data: {
        user,
        token: accessToken,
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    throw error;
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Account is deactivated');
    }

    // Generate tokens
    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Set HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    logger.info(`User logged in: ${user.email}`);

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        token: accessToken,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    throw error;
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
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
      throw ApiError.notFound('User not found');
    }

    res.json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    logger.error('Get current user error:', error);
    throw error;
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw ApiError.unauthorized('Refresh token is required');
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET! + '_REFRESH'
    ) as { userId: string; tokenId: string };

    // Find the token in the database
    const tokenRecord = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        userId: decoded.userId,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!tokenRecord) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    // Generate new access token
    const accessToken = generateToken(decoded.userId);

    res.json({
      status: 'success',
      data: {
        token: accessToken,
      },
    });
  } catch (error) {
    logger.error('Refresh token error:', error);
    throw ApiError.unauthorized('Invalid refresh token');
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Revoke the refresh token
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revoked: true },
      });

      // Clear the refresh token cookie
      res.clearCookie('refreshToken');
    }

    res.json({
      status: 'success',
      message: 'Successfully logged out',
    });
  } catch (error) {
    logger.error('Logout error:', error);
    throw error;
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required',
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal that the email doesn't exist
      return res.json({
        status: 'success',
        message: 'If an account with that email exists, a password reset link has been sent',
      });
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET! + user.passwordHash,
      { expiresIn: '1h' }
    );

    // In a real app, you would send an email with a reset link
    // For now, we'll just log it
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&id=${user.id}`;
    logger.info(`Password reset link for ${email}: ${resetUrl}`);

    return res.json({
      status: 'success',
      message: 'If an account with that email exists, a password reset link has been sent',
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while processing your request',
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, userId, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Verify token
    try {
      jwt.verify(token, process.env.JWT_SECRET! + user.passwordHash);
    } catch (error) {
      throw ApiError.unauthorized('Invalid or expired token');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    // Revoke all user's refresh tokens
    await prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });

    logger.info(`Password reset for user: ${user.email}`);

    res.json({
      status: 'success',
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    throw error;
  }
};
