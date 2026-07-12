/**
 * Wake Neon (free tier sleeps) via Node pg, then retry prisma db push.
 * Prisma CLI's engine often fails with P1001 while Node pg succeeds.
 */
import 'dotenv/config';
import { execSync } from 'node:child_process';
import pg from 'pg';

const url = (process.env.DIRECT_URL || process.env.DATABASE_URL || '').split('?')[0];
if (!url) {
  console.error('Missing DATABASE_URL / DIRECT_URL in server/.env');
  process.exit(1);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function wakeNeon(attempts = 5) {
  for (let i = 1; i <= attempts; i++) {
    const client = new pg.Client({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 25_000,
    });
    try {
      console.log(`Waking Neon (attempt ${i}/${attempts})...`);
      await client.connect();
      await client.query('SELECT 1');
      await client.end();
      console.log('Neon is reachable.');
      return true;
    } catch (e) {
      console.warn(`Wake failed: ${e.message}`);
      try {
        await client.end();
      } catch {
        /* ignore */
      }
      await sleep(3000 * i);
    }
  }
  return false;
}

async function pushWithRetry(attempts = 4) {
  for (let i = 1; i <= attempts; i++) {
    try {
      console.log(`prisma db push (attempt ${i}/${attempts})...`);
      execSync('npx prisma db push --skip-generate', {
        stdio: 'inherit',
        env: process.env,
      });
      return true;
    } catch {
      console.warn(`db push failed (attempt ${i}).`);
      if (i < attempts) await sleep(4000 * i);
    }
  }
  return false;
}

const awake = await wakeNeon();
if (!awake) {
  console.error(
    'Could not reach Neon. Open https://console.neon.tech , start the compute, then retry: npm run db:setup'
  );
  process.exit(1);
}

const ok = await pushWithRetry();
if (!ok) {
  console.warn(
    'prisma db push still hit P1001. If tables already exist on Neon, seed will still work — continuing.'
  );
}
