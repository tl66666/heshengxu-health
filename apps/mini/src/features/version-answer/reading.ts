import type { TopicId } from './content.js';
export const topicReading = {
  muscle: {
    headline: '把训练、饮食和恢复接起来',
    summary: '先建立自己的基线，再用真实记录决定下一步。',
    sourceLabel: '邵艾伦 · 训练、饮食与减脂原片',
    sourceUrl: 'https://www.bilibili.com/video/BV1httT6LEfy/',
    wash: '#e9eddf',
  },
  sun: {
    headline: '先探图，再做自己的选择',
    summary: '把人物经验变成比较清单，给自己的决定留下依据。',
    sourceLabel: '邵艾伦 × 孙宇晨 · 原始对谈',
    sourceUrl: 'https://www.bilibili.com/video/BV1fcHD6cEw3/',
    wash: '#f3e8cf',
  },
  water: {
    headline: '从下一杯水，回到日常生活',
    summary: '网络热词是入口；喝水记录与个体需要才是实践的起点。',
    sourceLabel: 'CDC · 饮水与健康饮品',
    sourceUrl: 'https://www.cdc.gov/healthy-weight-growth/water-healthy-drinks/',
    wash: '#e4eef0',
  },
  codex: {
    headline: '交付一个能检查的小成果',
    summary: '把目标、上下文和验证方式写清楚，再观察 AI 真正做了什么。',
    sourceLabel: 'Codex · 官方任务与提示指南',
    sourceUrl: 'https://developers.openai.com/codex/prompting',
    wash: '#e9ecf0',
  },
  life: {
    headline: '挑一条用得上的，做完就够了',
    summary: '按自己的时间与精力选行动，保留原出处和适用条件。',
    sourceLabel: '高性价比人生指南 · 原仓库',
    sourceUrl: 'https://github.com/eternity4719/HowToLiveBetter',
    wash: '#edf0df',
  },
} satisfies Record<
  TopicId,
  { headline: string; summary: string; sourceLabel: string; sourceUrl: string; wash: string }
>;
