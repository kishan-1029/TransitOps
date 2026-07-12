/**
 * Windows: Prisma generate fails with EPERM if the API still holds
 * query_engine-windows.dll.node. Stop listeners on PORT, then generate.
 */
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const port = process.env.PORT || '5000';

function killPort(p) {
  try {
    const out = execSync(`netstat -ano | findstr :${p}`, { encoding: 'utf8' });
    const pids = new Set();
    for (const line of out.split(/\r?\n/)) {
      if (!line.includes('LISTENING')) continue;
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && /^\d+$/.test(pid) && pid !== '0') pids.add(pid);
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        console.log(`Stopped process ${pid} (port ${p})`);
      } catch {
        /* already gone */
      }
    }
  } catch {
    /* nothing listening */
  }
}

killPort(port);
// brief pause so Windows releases the DLL lock
await new Promise((r) => setTimeout(r, 1500));

const prismaCli = require.resolve('prisma/build/index.js');
execSync(`node "${prismaCli}" generate`, { stdio: 'inherit' });
