import { cpSync, existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const source = resolve(root, 'apps/mini/dist/build/mp-weixin');
const target = resolve(root, 'apps/mini/dist/dev/mp-weixin');

if (!existsSync(source)) throw new Error(`微信构建产物不存在：${source}`);
rmSync(target, { recursive: true, force: true });
cpSync(source, target, { recursive: true });
console.log(`已同步微信预览目录：${target}`);
