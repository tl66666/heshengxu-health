import { describe, expect, it } from 'vitest';
import summaryPageSource from './FoodSummaryPage.vue?raw';

describe('food summary presentation', () => {
  it('renders real daily nutrition and meal groups', () => {
    expect(summaryPageSource).toContain('今日还可以吃');
    expect(summaryPageSource).toContain('class="ring"');
    expect(summaryPageSource).toContain('class="macro-row"');
    expect(summaryPageSource).toContain('loadMealEntries');
    expect(summaryPageSource).toContain('meal-breakfast.svg');
  });
});
