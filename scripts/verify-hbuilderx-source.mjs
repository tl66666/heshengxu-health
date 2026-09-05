import { existsSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const root = resolve(repositoryRoot, 'apps/mini');
const ignored = new Set(['node_modules', 'dist', '.git']);
const limit = 4 * 1024 * 1024;
const bitmapPattern = /\.(?:png|jpe?g|webp|gif)$/iu;
const files = collect(root);
const bytes = files.reduce((sum, file) => sum + statSync(file).size, 0);
const sourceBitmaps = files.filter((file) => bitmapPattern.test(file));

if (bytes >= limit) {
  throw new Error(`HBuilderX source payload is ${(bytes / 1024 / 1024).toFixed(2)} MB; keep it below 4 MB.`);
}
if (sourceBitmaps.length > 0) {
  throw new Error(`HBuilderX source tree still contains ${sourceBitmaps.length} bitmap files. Run npm --prefix apps/mini run clean:source-assets.`);
}

console.log(`HBuilderX source check passed: ${(bytes / 1024 / 1024).toFixed(2)} MB, no bitmap cache files.`);

function collect(directory) {
  const files = [];
  for (const entry of readdirSync(directory)) {
    if (ignored.has(entry)) continue;
    const full = resolve(directory, entry);
    if (statSync(full).isDirectory()) files.push(...collect(full));
    else files.push(full);
  }
  return files;
}
