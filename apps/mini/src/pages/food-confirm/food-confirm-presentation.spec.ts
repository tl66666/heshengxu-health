import { describe, expect, it } from 'vitest';
import foodConfirmPageSource from './FoodConfirmPage.vue?raw';

describe('food confirmation presentation', () => {
  it('uses the shared navigation and keeps nutrition preview visible', () => {
    expect(foodConfirmPageSource).toContain('<AppNavBar title="确认这份食物"');
    expect(foodConfirmPageSource).toContain('class="nutrition"');
    expect(foodConfirmPageSource).toContain('class="save"');
    expect(foodConfirmPageSource).not.toContain('class="back"');
    expect(foodConfirmPageSource).not.toContain('>‹</button>');
    expect(foodConfirmPageSource).toContain('getFoodCategoryIcon(food.category?.slug, food.name)');
    expect(foodConfirmPageSource).not.toMatch(/[🍚🥚🥦🍎🍽️]/u);
  });

  it('supports meal context, personal foods, and saving photo results to the library', () => {
    expect(foodConfirmPageSource).toContain('data-testid="save-to-library"');
    expect(foodConfirmPageSource).toContain(':checked="saveToLibrary"');
    expect(foodConfirmPageSource).toContain('@change="updateSaveToLibrary"');
    expect(foodConfirmPageSource).toContain('options?.mealType');
    expect(foodConfirmPageSource).toContain('options?.userFoodId');
    expect(foodConfirmPageSource).toContain('options?.candidateId');
    expect(foodConfirmPageSource).toContain('createUserFood');
    expect(foodConfirmPageSource).toContain('confirmRecognition');
    expect(foodConfirmPageSource).toContain('userFoodId:');
  });
});
