import { Buffer } from 'node:buffer';
import { existsSync, readdirSync, readFileSync, statSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const sourceRoots = [
  [resolve(root, 'assets/illustrations'), resolve(root, 'apps/mini/src/static/illustrations')],
  [resolve(root, 'assets/mini-icons'), resolve(root, 'apps/mini/src/static/icons')],
];

let removed = 0;
for (const [canonicalRoot, generatedRoot] of sourceRoots) {
  if (!existsSync(canonicalRoot) || !existsSync(generatedRoot)) continue;
  removed += removeMatchingBitmaps(canonicalRoot, generatedRoot);
}

console.log(`Removed ${removed} generated bitmap files from the HBuilderX source tree.`);

function removeMatchingBitmaps(canonicalDirectory, generatedDirectory) {
  let count = 0;
  for (const name of readdirSync(generatedDirectory)) {
    const generatedPath = resolve(generatedDirectory, name);
    const canonicalPath = resolve(canonicalDirectory, name);
    if (statSync(generatedPath).isDirectory()) {
      count += removeMatchingBitmaps(canonicalPath, generatedPath);
      continue;
    }
    if (!/\.(?:png|jpe?g|webp|gif)$/iu.test(name)) continue;
    if (!existsSync(canonicalPath)) continue;
    if (Buffer.compare(readFileSync(canonicalPath), readFileSync(generatedPath)) !== 0) continue;
    unlinkSync(generatedPath);
    count += 1;
  }
  return count;
}
