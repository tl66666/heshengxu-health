import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

// 支持显式传入产物目录（如 dist/dev/mp-weixin），默认按构建目录检查。
const root = process.argv[2]
  ? resolve(process.cwd(), process.argv[2])
  : ([
      resolve(process.cwd(), 'dist/build/mp-weixin'),
      resolve(process.cwd(), 'apps/mini/dist/build/mp-weixin'),
    ].find((candidate) => existsSync(resolve(candidate, 'app.json'))) ??
    resolve(process.cwd(), 'dist/build/mp-weixin'));

const required = [
  'app.json',
  'app.js',
  'pages/onboarding/OnboardingPage.js',
  'pages/home/HomePage.js',
  'pages/records/RecordsPage.js',
  'pages/plan/PlanPage.js',
  'pages/xuxu/XuxuPage.js',
  'pages/me/MePage.js',
  'components/MiniTabBar.js',
];
const missing = required.filter((file) => !existsSync(resolve(root, file)));

if (missing.length > 0) {
  console.error(`微信小程序构建产物缺少文件：${missing.join(', ')}`);
  process.exit(1);
}

if (existsSync(resolve(root, 'custom-tab-bar'))) {
  console.error('微信构建产物包含已废弃的 custom-tab-bar 目录，请清空 dist 后重新构建。');
  process.exit(1);
}

const app = JSON.parse(readFileSync(resolve(root, 'app.json'), 'utf8'));
if (!Array.isArray(app.pages) || app.pages.length < 3) {
  console.error('app.json 页面数量异常，请确认 uni-app 构建是否完整。');
  process.exit(1);
}

function collectJsFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...collectJsFiles(full));
    } else if (entry.endsWith('.js')) {
      files.push(full);
    }
  }
  return files;
}

// 编译产物里每个 require 的相对模块都必须存在；缺失会让小程序启动即白屏报
// "module is not defined"，这里把这类损坏拦在提交之前。
const brokenRequires = [];
for (const file of collectJsFiles(root)) {
  const source = readFileSync(file, 'utf8');
  for (const match of source.matchAll(/require\(\s*["'](\.[^"']+)["']\s*\)/g)) {
    const base = resolve(file, '..', match[1]);
    if (!existsSync(base) && !existsSync(`${base}.js`)) {
      brokenRequires.push(`${file} -> ${match[1]}`);
    }
  }
}

if (brokenRequires.length > 0) {
  console.error(`微信构建产物存在缺失的模块引用：\n${brokenRequires.join('\n')}`);
  process.exit(1);
}

console.log(`微信小程序构建产物检查通过：${root}`);
