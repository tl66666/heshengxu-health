import { describe, expect, it } from 'vitest';
import { summarizeFoodEntries } from './food.summary.js';

describe('daily food summary', () => {
  it('adds nutrition snapshots without recalculating from catalog', () => {
    expect(summarizeFoodEntries([
      { id: '1', mealType: 'breakfast', foodNameSnapshot: '鸡蛋', grams: 50, energyKcal: 72, proteinG: 6.7, fatG: 4.4, carbohydrateG: 1.4, recordedAt: '' },
      { id: '2', mealType: 'lunch', foodNameSnapshot: '米饭', grams: 150, energyKcal: 174, proteinG: 3.9, fatG: 0.5, carbohydrateG: 38.8, recordedAt: '' },
    ])).toEqual({ energyKcal: 246, proteinG: 10.6, fatG: 4.9, carbohydrateG: 40.2 });
  });
});
