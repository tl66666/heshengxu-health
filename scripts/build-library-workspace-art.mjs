import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const require = createRequire(import.meta.url);
const sharp = require(process.argv[2] ? resolve(process.argv[2], 'sharp') : 'sharp');
const data = await sharp(
  readFileSync(resolve(root, 'assets/illustrations/version-answer/workspace-scene.png')),
)
  .resize({ width: 280 })
  .png({ palette: true, colours: 96, compressionLevel: 9 })
  .toBuffer();
writeFileSync(
  resolve(root, 'apps/mini/src/features/version-answer/workspace-art.ts'),
  '// Model-created watercolor workspace; original retained in assets.\nexport const workspaceScene = ' +
    JSON.stringify('data:image/png;base64,' + data.toString('base64')) +
    ';\n',
);
console.log('Workspace scene: ' + data.length + ' bytes');
