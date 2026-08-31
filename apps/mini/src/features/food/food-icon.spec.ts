import { describe, expect, it } from 'vitest';
import { getFoodCategoryIcon } from './food-icon.js';

describe('food category icons', () => {
  it('uses a dedicated icon for known categories and a neutral fallback', () => {
    expect(getFoodCategoryIcon('egg')).toBe('/static/icons/svg/food-egg.svg');
    expect(getFoodCategoryIcon('vegetable')).toBe('/static/icons/svg/food-vegetable.svg');
    expect(getFoodCategoryIcon('unknown')).toBe('/static/icons/svg/meal.svg');
  });
});
