import { describe, expect, it } from 'vitest';
import { isTabRoute } from '../../components/navigation.js';
import weeklyReviewSource from './WeeklyReviewPage.vue?raw';

describe('weekly review page navigation', () => {
  it('opens the records tab with switchTab so the primary shortcut really works', () => {
    expect(weeklyReviewSource).toMatch(
      /uni\.switchTab\(\{\s*url:\s*'\/pages\/records\/RecordsPage'/,
    );
  });

  it('never calls navigateTo on a tab route', () => {
    const navigateBlocks = weeklyReviewSource.match(/uni\.navigateTo\(\{[\s\S]*?\}\)/g) ?? [];
    for (const block of navigateBlocks) {
      const url = block.match(/url:\s*'([^']+)'/)?.[1];
      if (url) expect(isTabRoute(url)).toBe(false);
    }
  });
});
