import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { Buffer } from 'node:buffer';

const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const root = resolve(repositoryRoot, 'apps/mini');
const ignored = new Set(['node_modules', 'dist', '.git']);
const limit = 4 * 1024 * 1024;
const bitmapPattern = /\.(?:png|jpe?g|webp|gif)$/iu;
const files = collect(root);
const keepCopies = process.argv.includes('--keep-preview-copies');
const previewCopies = keepCopies
  ? files.filter((file) => {
      const mappings = [
        ['src/static/illustrations', 'assets/illustrations'],
        ['src/static/icons', 'assets/mini-icons'],
      ];
      if (!bitmapPattern.test(file)) return false;
      return mappings.some(([from, to]) => {
        const path = relative(resolve(root, from), file);
        if (path.startsWith('..')) return false;
        const canonical = resolve(repositoryRoot, to, path);
        return (
          existsSync(canonical) && Buffer.compare(readFileSync(file), readFileSync(canonical)) === 0
        );
      });
    })
  : [];
const copies = new Set(previewCopies);
const bytes = files
  .filter((file) => !copies.has(file))
  .reduce((sum, file) => sum + statSync(file).size, 0);
const sourceBitmaps = files.filter(
  (file) =>
    bitmapPattern.test(file) &&
    !file.startsWith(resolve(root, 'src/static/app-icons')) &&
    !copies.has(file),
);

if (bytes >= limit) {
  throw new Error(
    `HBuilderX source payload is ${(bytes / 1024 / 1024).toFixed(2)} MB; keep it below 4 MB.`,
  );
}
if (sourceBitmaps.length > 0) {
  throw new Error(
    `HBuilderX source tree still contains ${sourceBitmaps.length} unmanaged bitmap files. Run npm --prefix apps/mini run clean:source-assets.`,
  );
}

console.log(
  `HBuilderX source check passed: ${(bytes / 1024 / 1024).toFixed(2)} MB code/config/icons; ${previewCopies.length} identical preview copies preserved. App output uses remote assets.`,
);

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
