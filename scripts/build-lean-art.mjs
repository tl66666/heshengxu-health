import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const require = createRequire(import.meta.url);
const sharp = require(process.argv[2] ? resolve(process.argv[2], 'sharp') : 'sharp');
const files = {
  muscle: 'lean-muscle.png',
  score: 'lean-muscle-score.png',
  bible: 'lean-muscle-bible.png',
};
const art = {};
for (const [name, file] of Object.entries(files)) {
  const original = readFileSync(resolve(root, 'assets/mini-icons/watercolor/lean-muscle', file));
  const icon = await sharp(original)
    .resize(160, 160, { fit: 'inside' })
    .png({ compressionLevel: 9, palette: true, colours: 128 })
    .toBuffer();
  art[name] = `data:image/png;base64,${icon.toString('base64')}`;
  console.log(`${name}: generated 160px derivative, ${icon.length} bytes; original unchanged`);
}
writeFileSync(
  resolve(root, 'apps/mini/src/features/lean-muscle/art.ts'),
  '// Generated from model-created originals by scripts/build-lean-art.mjs. Original assets stay unchanged.\nexport const leanArt = ' +
    JSON.stringify(art, null, 2) +
    ' as const;\n',
);
