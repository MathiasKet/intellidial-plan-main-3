import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { StatusCodes } from 'http-status-codes';
import { supabase } from '../index.js';
import { logger } from '../utils/logger.js';

// Generate JWT token
const generateToken = (userId, role = 'user') => {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );

  const refreshToken = jwt.sign(
    { userId, role },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'User already exists',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert([
        {
          id: uuidv4(),
          name,
          email,
          phone,
          password: hashedPassword,
          role: 'user', // Default role
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      logger.error(`Registration error: ${error.message}`);
      throw new Error('Registration failed');
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateToken(user.id, user.role);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(StatusCodes.CREATED).json({
      success: true,
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Server error during registration',
    });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateToken(user.id, user.role);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Refresh token is required',
    });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: decoded.userId, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    res.json({
      success: true,
      accessToken,
    });
  } catch (error) {
    logger.error(`Token refresh error: ${error.message}`);
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid or expired refresh token',
    });
  }
};

/**
 * @desc    Logout user (invalidate refresh token)
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = async (req, res) => {
  // In a real app, you might want to store invalidated tokens in a blacklist
  // For now, we'll just return success
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};
