import { existsSync, readFileSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';

const output = resolve(process.cwd(), process.argv[2] || 'dist/build/mp-weixin');
const assetBaseUrl = (process.env.VITE_MINI_ASSET_BASE_URL || '').trim().replace(/\/+$/u, '');
const bitmapFile = /\.(?:png|jpe?g|webp|gif)$/iu;
const compiledFile = /\.(?:js|json|wxml|wxss)$/iu;
const localBitmapReference =
  /(?:^|["'`(\s])\/static\/[^"'`\s)]+\.(?:png|jpe?g|webp|gif)/iu;

if (!assetBaseUrl.startsWith('https://')) {
  console.error('正式构建必须配置 HTTPS 的 VITE_MINI_ASSET_BASE_URL。');
  process.exit(1);
}
if (!existsSync(resolve(output, 'app.json'))) {
  console.error(`找不到微信小程序构建产物：${output}`);
  process.exit(1);
}

const files = collectFiles(output);
const localReferences = files
  .filter((file) => compiledFile.test(file))
  .filter((file) => localBitmapReference.test(readFileSync(file, 'utf8')));
if (localReferences.length) {
  console.error(`仍有本地位图引用，不能删除构建副本：\n${localReferences.join('\n')}`);
  process.exit(1);
}

const bitmaps = files.filter((file) => bitmapFile.test(file));
for (const file of bitmaps) unlinkSync(file);
console.log(`正式构建已远程化 ${bitmaps.length} 个位图，原始图片未压缩、未删除。`);

function collectFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory)) {
    const path = resolve(directory, entry);
    if (statSync(path).isDirectory()) files.push(...collectFiles(path));
    else files.push(path);
  }
  return files;
}
