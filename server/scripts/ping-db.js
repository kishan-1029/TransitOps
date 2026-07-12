import 'dotenv/config';
import { prisma } from '../src/lib/prisma.js';

try {
  console.log('Connecting via Prisma pg adapter...');
  const users = await prisma.user.findMany({
    take: 2,
    select: { email: true, role: true },
  });
  console.log('OK', users);
} catch (e) {
  console.error('FAIL', e.code || '', e.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
  if (globalThis.__transitopsPool) {
    await globalThis.__transitopsPool.end();
  }
}
