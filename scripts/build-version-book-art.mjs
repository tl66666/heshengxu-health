import { createRequire } from 'node:module';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const require = createRequire(import.meta.url);
const sharp = require(process.argv[2] ? resolve(process.argv[2], 'sharp') : 'sharp');
const sources = {
  muscle: 'assets/illustrations/lean-muscle-v2/bible-cover.png',
  water: 'assets/illustrations/version-answer/books/water-v3.png',
  sun: 'assets/illustrations/version-answer/books/sun.png',
  codex: 'assets/illustrations/version-answer/books/codex.png',
  life: 'assets/illustrations/version-answer/books/life.png',
};
const covers = { muscle: '', sun: '', water: '', codex: '', life: '' };
for (const [id, file] of Object.entries(sources)) {
  const path = resolve(root, file);
  if (!existsSync(path)) continue;
  const data = await sharp(readFileSync(path))
    .resize({ width: 210 })
    .png({ palette: true, colours: 96, compressionLevel: 9 })
    .toBuffer();
  covers[id] = 'data:image/png;base64,' + data.toString('base64');
  console.log(`${id}: ${data.length} bytes`);
}
writeFileSync(
  resolve(root, 'apps/mini/src/features/version-answer/book-art.ts'),
  '// Generated derivatives of model-created covers; original files retained. Empty entries use the CSS hardcover.\nexport const bookCovers = ' +
    JSON.stringify(covers, null, 2) +
    ' as const;\n',
);
