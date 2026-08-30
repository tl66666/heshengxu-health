import { describe, expect, it } from 'vitest';
import foodSearchPageSource from './FoodSearchPage.vue?raw';

describe('food search presentation', () => {
  it('uses the shared navigation and icon assets for food selection', () => {
    expect(foodSearchPageSource).toContain('<AppNavBar title="选择食物"');
    expect(foodSearchPageSource).toContain('/static/icons/svg/search.svg');
    expect(foodSearchPageSource).toContain('/static/icons/svg/camera.svg');
    expect(foodSearchPageSource).toContain('/static/icons/svg/forward.svg');
    expect(foodSearchPageSource).not.toContain('>›<');
    expect(foodSearchPageSource).not.toContain('>✦<');
  });

  it('groups personal and catalog foods and preserves the meal context', () => {
    expect(foodSearchPageSource).toContain('personal-food-heading');
    expect(foodSearchPageSource).toContain('catalog-food-heading');
    expect(foodSearchPageSource).toContain('listUserFoods');
    expect(foodSearchPageSource).toContain('mealType');
    expect(foodSearchPageSource).toContain('&mealType=${mealType.value}');
  });
});
