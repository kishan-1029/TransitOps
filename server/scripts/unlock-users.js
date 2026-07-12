import 'dotenv/config';
import pg from 'pg';

const base = (process.env.DATABASE_URL || '').split('?')[0];
const c = new pg.Client({
  connectionString: `${base}?sslmode=require`,
  ssl: { rejectUnauthorized: false },
});

await c.connect();
const before = await c.query(
  'SELECT email, locked, "lockedUntil", "failedLoginAttempts" FROM "User"'
);
console.log('BEFORE', before.rows);
await c.query(
  'UPDATE "User" SET locked = false, "lockedUntil" = NULL, "failedLoginAttempts" = 0'
);
console.log('UNLOCKED_ALL');
await c.end();
