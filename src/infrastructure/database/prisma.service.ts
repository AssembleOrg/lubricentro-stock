import { PrismaPg } from '@prisma/adapter-pg';
// @ts-ignore - Prisma generated client
import { PrismaClient } from '../../../generated/prisma';
import { Pool, PoolConfig } from 'pg';

const connectionString = process.env.DATABASE_URL || '';

// Remove sslmode from connection string if present (for non-SSL connections)
let connectionStringWithoutSSL = connectionString;
if (connectionString.includes('sslmode=')) {
  // Remove sslmode parameter
  connectionStringWithoutSSL = connectionString
    .replace(/[?&]sslmode=[^&]*/, '') // Remove sslmode parameter
    .replace(/\?$/, ''); // Remove trailing ? if it exists
}

// Parse connection string - NO SSL config for now
const poolConfig: PoolConfig = {
  connectionString: connectionStringWithoutSSL,
  // SSL disabled for now
  ssl: false,
  // Additional options for connection pool
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

const pool = new Pool(poolConfig);
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

