import { describe, expect, it } from 'vitest';
import mealAddPageSource from './MealAddPage.vue?raw';

describe('meal add presentation', () => {
  it('uses image assets instead of emoji food icons', () => {
    expect(mealAddPageSource).toContain('getFoodCategoryIcon(categorySlugForFood(food.name), food.name)');
    expect(mealAddPageSource).not.toContain('getEmoji');
    expect(mealAddPageSource).not.toMatch(/[🍚🥚🍠🍳🥛🍞🍗🍎🍽️🔍📋⚡📷]/u);
  });

  it('exposes quantity controls in both the food list and selected drawer', () => {
    expect(mealAddPageSource).toContain('quantity-stepper');
    expect(mealAddPageSource).toContain('changeQuantity(food.id, -1)');
    expect(mealAddPageSource).toContain('changeQuantity(food.id, 1)');
    expect(mealAddPageSource).toContain('selectedCountTotal');
  });
});
