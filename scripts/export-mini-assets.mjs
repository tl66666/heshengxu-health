import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'dist/mini-assets/static');
const miniStatic = resolve(root, 'apps/mini/src/static');
const illustrations = resolve(root, 'assets/illustrations');
const miniIcons = resolve(root, 'assets/mini-icons');

if (!existsSync(miniStatic)) {
  throw new Error('找不到小程序静态资源目录。请先运行 scripts/sync-illustrations.mjs。');
}

rmSync(resolve(root, 'dist/mini-assets'), { recursive: true, force: true });
mkdirSync(output, { recursive: true });
copyDirectory(miniStatic, output);
copyDirectory(illustrations, resolve(output, 'illustrations'));
if (existsSync(miniIcons)) copyDirectory(miniIcons, resolve(output, 'icons'));
console.log(`原图已导出到 ${resolve(root, 'dist/mini-assets')}，可按原目录上传到静态托管。`);

function copyDirectory(source, target) {
  mkdirSync(target, { recursive: true });
  for (const entry of readdirSync(source)) {
    const from = resolve(source, entry);
    const to = resolve(target, entry);
    if (statSync(from).isDirectory()) copyDirectory(from, to);
    else copyFileSync(from, to);
  }
}
