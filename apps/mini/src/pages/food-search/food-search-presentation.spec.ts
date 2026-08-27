import { describe, expect, it } from 'vitest';
import foodSearchPageSource from './FoodSearchPage.vue?raw';

describe('food search presentation', () => {
  it('uses the shared navigation and icon assets for food selection', () => {
    expect(foodSearchPageSource).toContain('<AppNavBar title="选择食物"');
    expect(foodSearchPageSource).toContain('/static/icons/search.svg');
    expect(foodSearchPageSource).toContain('/static/icons/camera.svg');
    expect(foodSearchPageSource).toContain('/static/icons/forward.svg');
    expect(foodSearchPageSource).not.toContain('>›<');
    expect(foodSearchPageSource).not.toContain('>✦<');
  });
});
