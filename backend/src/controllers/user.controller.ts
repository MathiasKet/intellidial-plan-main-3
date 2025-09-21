import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { CreateUserDto, UpdateUserDto, LoginDto, UserResponseDto } from '../dtos/user.dto';
import userService from '../services/user.service';
import { BadRequestError, ValidationError } from '../utils/errors';
import { prisma } from '../utils/prisma';

class UserController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ValidationError(errors.mapped());
      }

      const userData: CreateUserDto = req.body;
      const newUser = await userService.createUser(userData);
      
      // Generate JWT token
      const token = this.generateToken(newUser.id);
      
      res.status(201).json({
        status: 'success',
        data: {
          user: newUser,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ValidationError(errors.mapped());
      }

      const { email, password }: LoginDto = req.body;
      const user = await userService.validateUser(email, password);
      
      if (!user) {
        throw new BadRequestError('Invalid email or password');
      }

      // Generate JWT token
      const token = this.generateToken(user.id);
      
      res.status(200).json({
        status: 'success',
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      // req.user is set by the auth middleware
      const userId = (req as any).user.id;
      const user = await userService.getUserById(userId);
      
      res.status(200).json({
        status: 'success',
        data: {
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ValidationError(errors.mapped());
      }

      const userId = (req as any).user.id;
      const userData: UpdateUserDto = req.body;
      
      // If password is being updated, hash it
      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);
      }

      const updatedUser = await userService.updateUser(userId, userData);
      
      res.status(200).json({
        status: 'success',
        data: {
          user: updatedUser,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      await userService.deleteUser(userId);
      
      res.status(204).json({
        status: 'success',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  private generateToken(userId: string): string {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
    
    return jwt.sign({ id: userId }, secret, {
      expiresIn,
    });
  }
}

export default new UserController();
