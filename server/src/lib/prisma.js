import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = globalThis;

function createPrisma() {
  // Strip query params — Pool handles TLS via `ssl`; Neon free tier needs a small pool.
  const connectionString = (process.env.DATABASE_URL || '').split('?')[0];
  const pool =
    globalForPrisma.__transitopsPool ||
    new pg.Pool({
      connectionString,
      max: 3,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 30_000,
      ssl: { rejectUnauthorized: false },
    });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.__transitopsPool = pool;
  }

  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.__transitopsPrisma || createPrisma();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__transitopsPrisma = prisma;
}

export default prisma;
