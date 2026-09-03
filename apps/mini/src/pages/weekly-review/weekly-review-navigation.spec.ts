import { describe, expect, it } from 'vitest';
import { isTabRoute } from '../../components/navigation.js';
import weeklyReviewSource from './WeeklyReviewPage.vue?raw';

describe('weekly review page navigation', () => {
  it('opens the records page with navigateTo after it left the tab bar', () => {
    expect(weeklyReviewSource).toMatch(
      /uni\.navigateTo\(\{\s*url:\s*'\/pages\/records\/RecordsPage'/,
    );
  });

  it('never calls switchTab on a non-tab route', () => {
    const switchBlocks = weeklyReviewSource.match(/uni\.switchTab\(\{[\s\S]*?\}\)/g) ?? [];
    for (const block of switchBlocks) {
      const url = block.match(/url:\s*'([^']+)'/)?.[1];
      if (url) expect(isTabRoute(url)).toBe(true);
    }
  });
});
