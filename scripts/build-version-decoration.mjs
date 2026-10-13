import { createRequire } from 'node:module';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const require = createRequire(import.meta.url);
const sharp = require(process.argv[2] ? resolve(process.argv[2], 'sharp') : 'sharp');
const file = resolve(root, 'assets/illustrations/version-answer/reading-vignette-v3.png');
if (!existsSync(file)) throw new Error('Missing generated reading vignette');
const data = await sharp(readFileSync(file))
  .resize({ width: 240 })
  .png({ palette: true, colours: 96, compressionLevel: 9 })
  .toBuffer();
writeFileSync(
  resolve(root, 'apps/mini/src/features/version-answer/decoration.ts'),
  '// Model-created watercolor vignette; original retained in assets.\nexport const readingDecoration = ' +
    JSON.stringify('data:image/png;base64,' + data.toString('base64')) +
    ';\n',
);
console.log('Reading decoration: ' + data.length + ' bytes');
