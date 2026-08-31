import { describe, expect, it } from 'vitest';
import { calorieBudget, sumCalories } from './calorie-budget.js';

describe('daily calorie budget', () => {
  it('sums entries and rounds to whole kcal', () => {
    expect(sumCalories([{ energyKcal: 120.4 }, { energyKcal: 79.4 }, { energyKcal: -20 }])).toBe(
      200,
    );
  });

  it('clamps remaining calories and exposes overage', () => {
    expect(calorieBudget(1800, 1942)).toEqual({
      targetKcal: 1800,
      consumedKcal: 1942,
      remainingKcal: 0,
      overByKcal: 142,
    });
  });
});
