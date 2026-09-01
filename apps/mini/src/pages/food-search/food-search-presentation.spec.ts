import { describe, expect, it } from 'vitest';
import foodSearchPageSource from './FoodSearchPage.vue?raw';

describe('food search presentation', () => {
  it('uses the shared navigation and icon assets for food selection', () => {
    expect(foodSearchPageSource).toContain('<AppNavBar title="选择食物"');
    expect(foodSearchPageSource).toContain('/static/icons/svg/search.svg');
    expect(foodSearchPageSource).toContain('/static/icons/camera.jpg');
    expect(foodSearchPageSource).toContain('/static/icons/svg/forward.svg');
    expect(foodSearchPageSource).not.toContain('>›<');
    expect(foodSearchPageSource).not.toContain('>✦<');
    expect(foodSearchPageSource).not.toContain('getFoodEmoji');
    expect(foodSearchPageSource).toContain('class="food-add"');
    expect(foodSearchPageSource).toContain('class="page-progress"');
    expect(foodSearchPageSource).not.toContain('page-button--primary');
    expect(foodSearchPageSource).toContain('class="cart-bar"');
    expect(foodSearchPageSource).toContain('class="cart-panel"');
    expect(foodSearchPageSource).toContain('class="budget-strip"');
    expect(foodSearchPageSource).toContain('/static/icons/breakfast.jpg');
    expect(foodSearchPageSource).toContain('FoodSummaryPage');
    expect(foodSearchPageSource).not.toMatch(/[🔥📚🟢🍽️🔍]/u);
  });

  it('provides an explicit meal switch for the active recording context', () => {
    expect(foodSearchPageSource).toContain('class="meal-switch"');
    expect(foodSearchPageSource).toContain('switchMealType');
    expect(foodSearchPageSource).toContain('/static/icons/lunch.jpg');
    expect(foodSearchPageSource).toContain('{{ mealLabel }}');
  });

  it('uses the provided meal art and exposes selection feedback', () => {
    expect(foodSearchPageSource).toContain('/static/icons/breakfast.jpg');
    expect(foodSearchPageSource).toContain('/static/icons/lunch.jpg');
    expect(foodSearchPageSource).toContain('cart-badge--pulse');
    expect(foodSearchPageSource).toContain('food-card--added');
  });
});
