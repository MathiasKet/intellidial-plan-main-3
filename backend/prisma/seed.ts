import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Hash the demo password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('demo123', salt);

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@example.com',
      phone: '+1234567890',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('Created demo user:', demoUser);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
