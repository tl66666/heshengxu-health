import { spawn } from 'node:child_process';

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options });
    child.once('error', reject);
    child.once('exit', (code, signal) => resolve({ code: code ?? 1, signal }));
  });
}

const migration = await run('npx', ['prisma', 'migrate', 'deploy', '--schema', 'apps/api/prisma/schema.prisma']);
if (migration.code !== 0) process.exit(migration.code);

// Start the API immediately so Azure health probes succeed while the bundled
// food catalogue is imported in the background (the first import can take a
// few minutes for tens of thousands of rows).
const api = spawn(process.execPath, ['apps/api/dist/main.js'], { stdio: 'inherit' });
const catalog = spawn(process.execPath, ['apps/api/prisma/ensure-food-catalog.mjs'], { stdio: 'inherit' });
catalog.once('error', (error) => console.error('[food-catalog] background process failed', error));
catalog.once('exit', (code) => {
  if (code !== 0) console.error(`[food-catalog] background import exited with code ${code}`);
});

api.once('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});
