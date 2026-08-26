import { describe, expect, it } from 'vitest';
import { weeklyReviewEntry } from './weekly-review.presentation.js';

describe('weekly review presentation', () => {
  it('explains insufficient data without inventing a trend', () => {
    expect(
      weeklyReviewEntry({
        coverage: { recordedDayCount: 1, requiredDayCount: 3, status: 'insufficient' },
      }),
    ).toEqual({
      title: '本周还在收集节律',
      caption: '再记录 2 天，就能形成一份基于真实记录的回顾。',
      action: '去记录',
    });
  });

  it('shows ready state only when the API confirms enough data', () => {
    expect(
      weeklyReviewEntry({
        coverage: { recordedDayCount: 4, requiredDayCount: 3, status: 'ready' },
      }),
    ).toEqual({ title: '本周回顾已准备好', caption: '已覆盖 4 天真实记录。', action: '查看回顾' });
  });
});
