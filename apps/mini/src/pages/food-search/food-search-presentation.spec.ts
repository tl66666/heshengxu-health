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
    expect(foodSearchPageSource).not.toMatch(/[🔥📚🟢🍽️🔍]/u);
  });
});
