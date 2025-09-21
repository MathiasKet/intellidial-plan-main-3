import { PrismaClient } from '@prisma/client';

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Handle Prisma Client known request error
prisma.$use(async (params, next) => {
  try {
    return await next(params);
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Handle unique constraint violation
      const field = error.meta?.target?.[0];
      throw new Error(`A record with this ${field} already exists.`);
    } else if (error.code === 'P2025') {
      // Handle record not found
      throw new Error('The requested record was not found.');
    }
    throw error;
  }
});

export default prisma;
