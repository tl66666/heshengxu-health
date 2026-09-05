import { Buffer } from 'node:buffer';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'assets/illustrations');
const target = resolve(root, 'apps/mini/src/static/illustrations');
const miniIconSource = resolve(root, 'assets/mini-icons');
const miniIconTarget = resolve(root, 'apps/mini/src/static/icons');

if (!existsSync(source)) {
  throw new Error(`Illustration source directory does not exist: ${source}`);
}

mkdirSync(target, { recursive: true });
syncDirectory(source, target);
if (existsSync(miniIconSource)) syncDirectory(miniIconSource, miniIconTarget);

console.log(`Synchronized illustration and bitmap assets to ${target}`);

function syncDirectory(fromDirectory, toDirectory) {
  mkdirSync(toDirectory, { recursive: true });
  for (const name of readdirSync(fromDirectory)) {
    const from = resolve(fromDirectory, name);
    const to = resolve(toDirectory, name);
    if (statSync(from).isDirectory()) {
      syncDirectory(from, to);
      continue;
    }
    if (existsSync(to) && Buffer.compare(readFileSync(from), readFileSync(to)) === 0) continue;
    copyFileSync(from, to);
  }
}
