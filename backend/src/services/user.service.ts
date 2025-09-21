import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dto';
import { NotFoundError, BadRequestError } from '../utils/errors';

const prisma = new PrismaClient();

class UserService {
  async createUser(userData: CreateUserDto) {
    const { email, password, ...rest } = userData;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new BadRequestError('User with this email already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        email,
        passwordHash: hashedPassword,
        ...rest,
        updatedAt: new Date(),
      },
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

    return user;
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
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
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async updateUser(id: string, userData: UpdateUserDto) {
    const user = await prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...userData,
        updatedAt: new Date(),
      },
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

    return updatedUser;
  }

  async deleteUser(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await prisma.user.delete({ where: { id } });
    
    return { message: 'User deleted successfully' };
  }

  async validateUser(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return null;
    }

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Return user without password
    const { passwordHash, ...result } = user;
    return result;
  }
}

export default new UserService();
