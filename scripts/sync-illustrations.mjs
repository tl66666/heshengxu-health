import { Buffer } from 'node:buffer';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'assets/illustrations');
const target = resolve(root, 'apps/mini/src/static/illustrations');

if (!existsSync(source)) {
  throw new Error(`Illustration source directory does not exist: ${source}`);
}

mkdirSync(target, { recursive: true });
for (const name of readdirSync(source)) {
  const from = resolve(source, name);
  const to = resolve(target, name);
  if (existsSync(to) && Buffer.compare(readFileSync(from), readFileSync(to)) === 0) continue;
  copyFileSync(from, to);
}

console.log(`Synchronized ${readdirSync(source).length} illustration assets to ${target}`);
