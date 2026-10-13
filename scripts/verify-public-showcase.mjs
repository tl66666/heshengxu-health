import { existsSync, readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const metadata = JSON.parse(
  readFileSync(resolve(root, 'assets/showcase/downloads.json'), 'utf8'),
).android;
const apk = resolve(root, 'assets/showcase', metadata.file);
const hash = createHash('sha256').update(readFileSync(apk)).digest('hex').toUpperCase();
if (statSync(apk).size !== metadata.sizeBytes || hash !== metadata.sha256.toUpperCase())
  throw new Error('公开 APK 与下载元数据不一致');
const shots = ['library', 'lean-hub', 'bible-directory', 'bible-reader', 'home'].map(
  (name) => `assets/showcase/runtime/${name}-20261013.jpg`,
);
const html = readFileSync(resolve(root, 'showcase/index.html'), 'utf8');
if (!html.includes('id="library"') || !html.includes('heshengxu-android.apk?v=20261013'))
  throw new Error('展示页缺少特色章节或最新下载入口');
for (const file of [
  ...shots,
  'assets/showcase/downloads.json',
  'assets/showcase/heshengxu-android.apk',
]) {
  if (!existsSync(resolve(root, file))) throw new Error(`缺少公开素材：${file}`);
  if (process.argv.includes('--built') && !existsSync(resolve(root, 'showcase/dist', file)))
    throw new Error(`发布产物缺少：${file}`);
}
console.log('公开展示资源和 APK 校验通过：五张用户原图、下载体积与 SHA256 一致。');
