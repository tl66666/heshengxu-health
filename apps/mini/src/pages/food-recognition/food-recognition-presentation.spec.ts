import { describe, expect, it } from 'vitest';
import foodRecognitionPageSource from './FoodRecognitionPage.vue?raw';

describe('food recognition presentation', () => {
  it('preserves meal context and offers manual search after recognition errors', () => {
    expect(foodRecognitionPageSource).toContain('options?.mealType');
    expect(foodRecognitionPageSource).toContain('manualSearch');
    expect(foodRecognitionPageSource).toContain('/pages/food-search/FoodSearchPage?mealType=');
    expect(foodRecognitionPageSource).toContain('imagePath=${encodeURIComponent(imagePath.value)}');
    expect(foodRecognitionPageSource).toContain('mealType=${mealType.value}');
  });

  it('uses semantic local art without emoji primary visuals', () => {
    expect(foodRecognitionPageSource).toContain('/static/illustrations/home-companion-banner.png');
    expect(foodRecognitionPageSource).not.toMatch(/[🔄💡📸✨⚠️]/u);
  });
});
