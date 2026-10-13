import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const input = readFileSync(resolve(root, 'docs/product/lean-muscle-bible.md'), 'utf8');
const ids = [
  'understanding',
  'start',
  'progress',
  'food',
  'recovery',
  'changes',
  'pitfalls',
  'consistency',
];
const routes = [
  '/pages/lean-muscle/SettingsPage',
  '/pages/lean-muscle/SettingsPage',
  '/pages/lean-muscle/TrainingPage',
  '/pages/food-summary/FoodSummaryPage',
  '/pages/sleep/SleepDetailPage',
  '/pages/weight/WeightDetailPage',
  '/pages/lean-muscle/SettingsPage',
  '/pages/lean-muscle/LeanMusclePage?section=review',
];
const chapters = input
  .split(/^## /m)
  .slice(1, 9)
  .map((section, index) => {
    const lines = section.trim().split('\n');
    const principle =
      lines
        .find((l) => l.startsWith('**核心原则'))
        ?.replace(/\*\*/g, '')
        .replace('核心原则：', '') || '';
    const action =
      lines
        .find((l) => l.startsWith('**今天一个行动'))
        ?.replace(/\*\*/g, '')
        .replace('今天一个行动：', '') || '';
    const sources = [...section.matchAll(/\[([^\]]+)\]\((https:\/\/[^)]+)\)/g)].map((m) => ({
      title: m[1],
      url: m[2],
    }));
    const paragraphs = lines
      .slice(1)
      .filter((line) => line.trim() && !line.startsWith('**') && !line.startsWith('来源：'))
      .map((line) => line.replace(/^- /, '• '));
    return {
      id: ids[index],
      number: index + 1,
      title: lines[0]?.replace(/^第.章：/, '') || '',
      principle,
      action,
      route: routes[index],
      paragraphs,
      sources,
      minutes: Math.max(1, Math.ceil(section.length / 350)),
    };
  });
if (
  chapters.length !== 8 ||
  chapters.some((c) => !c.id || !c.principle || !c.action || !c.sources.length)
)
  throw new Error('圣经章节缺少正文、行动或来源');
writeFileSync(
  resolve(root, 'apps/mini/src/features/lean-muscle/bible.ts'),
  '// Generated from docs/product/lean-muscle-bible.md by scripts/build-lean-bible.mjs\nexport const bibleChapters = ' +
    JSON.stringify(chapters, null, 2) +
    ' as const;\n',
);
console.log('Generated 8 lean muscle guide chapters.');
