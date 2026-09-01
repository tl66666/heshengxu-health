import { describe, expect, it } from 'vitest';
import foodDetailPageSource from './FoodDetailPage.vue?raw';

describe('food detail presentation', () => {
  it('uses the same category icon system as the food list', () => {
    expect(foodDetailPageSource).toContain('getFoodCategoryIcon(food.category?.slug, food.name)');
    expect(foodDetailPageSource).not.toContain('getFoodEmoji');
    expect(foodDetailPageSource).not.toMatch(/[💡📏🔬🔴🟢🟡]/u);
  });
});
