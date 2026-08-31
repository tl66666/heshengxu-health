import { describe, expect, it } from 'vitest';
import mealAddPageSource from './MealAddPage.vue?raw';

describe('meal add presentation', () => {
  it('uses image assets instead of emoji food icons', () => {
    expect(mealAddPageSource).toContain('getFoodCategoryIcon(categorySlugForFood(food.name))');
    expect(mealAddPageSource).not.toContain('getEmoji');
    expect(mealAddPageSource).not.toMatch(/[🍚🥚🍠🍳🥛🍞🍗🍎🍽️🔍📋⚡📷]/u);
  });
});
