import { existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd(), 'apps/mini/dist');
for (const name of ['dev', 'build']) {
  const target = resolve(root, name);
  if (existsSync(target)) rmSync(target, { recursive: true, force: true });
}
console.log(`已清理微信小程序构建产物：${root}`);
