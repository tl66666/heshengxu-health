import type { GuideSource } from './types.js';
export const ALAN: GuideSource = {
  title: '邵艾伦：如何练出薄肌？',
  url: 'https://www.bilibili.com/video/BV1httT6LEfy/',
  kind: '本人视频',
};
export const INTERVIEW: GuideSource = {
  title: '邵艾伦 × 孙宇晨：年轻人如何抓住 AI 时代的机会？',
  url: 'https://www.bilibili.com/video/BV1fcHD6cEw3/',
  kind: '原始访谈',
};
export const ACSM: GuideSource = {
  title: 'ACSM 2026 抗阻训练指南',
  url: 'https://acsm.org/resistance-training-guidelines-update-2026/',
  kind: '专业指南',
};
export const WATER: GuideSource = {
  title: 'CDC：水与健康饮品',
  url: 'https://www.cdc.gov/healthy-weight-growth/water-healthy-drinks/',
  kind: '官方健康资料',
};
export const CHINA_WATER: GuideSource = {
  title: '中国疾控中心：科学定制饮水量',
  url: 'https://ncrwstg.chinacdc.cn/kpyd/202405/t20240511_277786.htm',
  kind: '官方健康资料',
};
export const CODEX: GuideSource = {
  title: 'Codex 官方快速开始',
  url: 'https://developers.openai.com/codex/quickstart',
  kind: '官方文档',
};
export const PROMPT: GuideSource = {
  title: 'Codex 官方提示与验证示例',
  url: 'https://developers.openai.com/codex/prompting',
  kind: '官方文档',
};
export const LIFE_BASE = 'https://github.com/eternity4719/HowToLiveBetter';
export const lifeSource = (file: string): GuideSource => ({
  title: '高性价比人生指南 · ' + file.slice(3, -3),
  url: `${LIFE_BASE}/blob/main/book/${encodeURIComponent(file)}`,
  kind: '开源指南',
});
export const CREDIT =
  '参考 eternity4719/HowToLiveBetter，正文许可 CC BY 4.0。此处为和生序选编与改写，核对于 2026-10-13；原书的证据评级不自动成为本页所有行动的评级。';

export const CODEX_REPO: GuideSource = {
  title: 'OpenAI Codex CLI · 官方 README',
  url: 'https://github.com/openai/codex',
  kind: '官方开源文档',
};
export const SKILLS: GuideSource = {
  title: 'Codex · 构建技能',
  url: 'https://developers.openai.com/codex/skills',
  kind: '官方文档',
};
export const SAFE: GuideSource = {
  title: 'OpenAI · Codex 安全运行边界',
  url: 'https://openai.com/index/running-codex-safely/',
  kind: '官方说明',
};
