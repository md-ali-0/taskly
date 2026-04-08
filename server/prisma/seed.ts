import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { loadEnvironment } from '../src/common/config/env.loader';

const demoUsers = [
  {
    email: 'admin@taskly.com',
    name: 'Taskly Admin',
    password: 'Admin@123456',
    role: Role.ADMIN,
  },
  {
    email: 'user@taskly.com',
    name: 'Taskly User',
    password: 'User@123456',
    role: Role.USER,
  },
] as const;

async function main() {
  loadEnvironment();

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is required to run Prisma seed');
  }

  const pool = new Pool({
    connectionString,
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    for (const user of demoUsers) {
      const passwordHash = await bcrypt.hash(user.password, 10);

      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          passwordHash,
          role: user.role,
          status: 'ACTIVE',
          deletedAt: null,
          emailVerified: true,
          tokenVersion: 0,
        },
        create: {
          email: user.email,
          name: user.name,
          passwordHash,
          role: user.role,
          status: 'ACTIVE',
          emailVerified: true,
        },
      });
    }

    console.log('Seed completed successfully.');
    console.log('Admin: admin@taskly.com / Admin@123456');
    console.log('User: user@taskly.com / User@123456');
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

void main().catch((error) => {
  console.error('Seed failed:', error);
  process.exitCode = 1;
});
