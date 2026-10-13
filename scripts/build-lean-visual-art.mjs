import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const require = createRequire(import.meta.url);
const sharp = require(process.argv[2] ? resolve(process.argv[2], 'sharp') : 'sharp');
const files = { paper: 'book-paper.png', cover: 'bible-cover.png', scene: 'training-scene.png' };
const art = {};
for (const [name, file] of Object.entries(files)) {
  const image = sharp(readFileSync(resolve(root, 'assets/illustrations/lean-muscle-v2', file)));
  const buffer =
    name === 'paper'
      ? await image.resize({ width: 480 }).jpeg({ quality: 65, mozjpeg: true }).toBuffer()
      : await image
          .resize({ width: name === 'cover' ? 360 : 600 })
          .png({ compressionLevel: 9, palette: true, colours: 128 })
          .toBuffer();
  art[name] = `data:image/${name === 'paper' ? 'jpeg' : 'png'};base64,${buffer.toString('base64')}`;
  console.log(`${name}: ${buffer.length} bytes`);
}
writeFileSync(
  resolve(root, 'apps/mini/src/features/lean-muscle/visual-art.ts'),
  '// Generated lightweight derivatives; originals retained in assets/illustrations/lean-muscle-v2.\nexport const leanVisualArt = ' +
    JSON.stringify(art, null, 2) +
    ' as const;\n',
);
