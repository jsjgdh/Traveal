import { PrismaClient } from '@prisma/client';
import { config } from './environment';
import logger from '@/utils/logger';

declare global {
  var __prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development
const prisma = globalThis.__prisma || new PrismaClient({
  log: config.isDevelopment ? [
    { level: 'error', emit: 'stdout' },
    { level: 'info', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ] : ['error'],
  errorFormat: 'pretty',
});

if (config.isDevelopment) {
  globalThis.__prisma = prisma;
}

// Database connection test
export const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info('📊 Database connected successfully');
    return true;
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    return false;
  }
};

// Graceful shutdown
export const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    logger.info('📊 Database disconnected');
  } catch (error) {
    logger.error('❌ Database disconnection failed:', error);
  }
};

export { prisma };
export default prisma;