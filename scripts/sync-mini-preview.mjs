import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const source = resolve(root, 'apps/mini/dist/build/mp-weixin');
const target = resolve(root, 'apps/mini/dist/dev/mp-weixin');

if (!existsSync(source)) throw new Error(`微信构建产物不存在：${source}`);
syncDirectory(source, target);
console.log(`已同步微信预览目录：${target}`);

function syncDirectory(from, to) {
  mkdirSync(to, { recursive: true });
  const sourceEntries = new Map(
    readdirSync(from, { withFileTypes: true }).map((entry) => [entry.name, entry]),
  );

  for (const targetEntry of readdirSync(to, { withFileTypes: true })) {
    if (!sourceEntries.has(targetEntry.name)) {
      rmSync(resolve(to, targetEntry.name), { recursive: true, force: true });
    }
  }

  for (const entry of sourceEntries.values()) {
    const sourcePath = resolve(from, entry.name);
    const targetPath = resolve(to, entry.name);
    if (entry.isDirectory()) {
      syncDirectory(sourcePath, targetPath);
      continue;
    }
    if (!entry.isFile()) continue;
    if (existsSync(targetPath)) {
      const sourceStat = statSync(sourcePath);
      const targetStat = statSync(targetPath);
      if (sourceStat.size === targetStat.size && sourceStat.mtimeMs === targetStat.mtimeMs)
        continue;
    }
    copyFileSync(sourcePath, targetPath);
  }
}
