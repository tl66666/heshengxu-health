import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const requiredDirectories = [
  'apps/mini/src/pages',
  'apps/mini/src/components',
  'apps/mini/src/features',
  'apps/mini/src/services',
  'apps/mini/src/stores',
  'apps/mini/src/static/icons',
  'apps/api/src/modules',
  'packages/contracts/src',
  'packages/domain/src',
  'assets/illustrations',
  'docs/architecture',
  'docs/superpowers/plans',
];

const missingDirectories = requiredDirectories.filter(
  (directory) => !existsSync(resolve(repoRoot, directory)),
);
if (missingDirectories.length > 0) {
  console.error(`仓库结构缺少目录：${missingDirectories.join(', ')}`);
  process.exit(1);
}

const forbiddenSourcePaths = [
  'apps/mini/src/custom-tab-bar/index.vue',
  'apps/mini/src/styles/tokens.scss',
];
const stalePaths = forbiddenSourcePaths.filter((file) => existsSync(resolve(repoRoot, file)));
if (stalePaths.length > 0) {
  console.error(`发现已废弃源码入口：${stalePaths.join(', ')}`);
  process.exit(1);
}

const trackedFiles = execFileSync('git', ['ls-files'], { cwd: repoRoot, encoding: 'utf8' })
  .split(/\r?\n/)
  .filter(Boolean);
const forbiddenTracked = trackedFiles.filter(
  (file) =>
    file !== '.env.example' &&
    /(^|\/)(dist|node_modules|\.env($|\.)|.*\.log$|project\.private\.config\.json$|package-lock\.json$)/i.test(
      file,
    ),
);
if (forbiddenTracked.length > 0) {
  console.error(`发现不应提交的文件：${forbiddenTracked.join(', ')}`);
  process.exit(1);
}

console.log('仓库结构检查通过：目录边界和禁提交规则均符合规范。');
