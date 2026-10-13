import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function assertMiniStyles(root) {
  const file = resolve(root, 'app.wxss');
  if (!existsSync(file)) throw new Error('微信样式缺少 app.wxss');
  const css = readFileSync(file, 'utf8');
  const checks = [
    ['薄肌页面基础间距', '.lean-page', 'padding'],
    ['薄肌横向导航', '.lean-page .tabs', 'display', 'flex'],
    ['评分周切换布局', '.lean-page .week-control', 'display', 'flex'],
    ['手账标题布局', '.hero-date-stamp', 'display', 'flex'],
    ['手账插图定位', '.journal-scene', 'position', 'absolute'],
    ['书柜书籍排列', '.books-on-shelf', 'display', 'flex'],
    ['阅读标题层级', '.version-hero-title', 'font-size'],
  ];
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  const missing = checks.filter(
    ([, selector, property, value]) =>
      !rules.some(
        (match) =>
          match[1]
            .trim()
            .split(',')
            .map((s) => s.trim())
            .includes(selector) &&
          new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*${value || '[^;]+'}(?:\\s*[;}]|$)`).test(
            match[2],
          ),
      ),
  );
  if (missing.length)
    throw new Error(`微信基础样式缺失：${missing.map(([name]) => name).join('、')}`);
}

if (
  process.argv[1] &&
  import.meta.url.endsWith('verify-mini-styles.mjs') &&
  resolve(process.argv[1]).replaceAll('\\', '/').endsWith('/verify-mini-styles.mjs')
) {
  try {
    assertMiniStyles(resolve(process.cwd(), process.argv[2] || 'apps/mini/dist/dev/mp-weixin'));
    console.log('微信基础布局和书柜样式检查通过。');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
