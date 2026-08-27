import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const roots = [
  resolve(process.cwd(), 'dist/build/mp-weixin'),
  resolve(process.cwd(), 'apps/mini/dist/build/mp-weixin'),
];
const root = roots.find((candidate) => existsSync(resolve(candidate, 'app.json'))) ?? roots[0];
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
const appTemplateFiles = ['app.wxml', 'App.wxml'];
if (!appTemplateFiles.some((file) => existsSync(resolve(root, file)))) {
  missing.push(appTemplateFiles.join(' or '));
}

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

console.log(`微信小程序构建产物检查通过：${root}`);
