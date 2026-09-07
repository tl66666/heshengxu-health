import { describe, expect, it } from 'vitest';
import foodConfirmPageSource from './FoodConfirmPage.vue?raw';

describe('food confirmation presentation', () => {
  it('uses the shared navigation and keeps nutrition preview visible', () => {
    expect(foodConfirmPageSource).toContain('<AppNavBar title="确认这份食物"');
    expect(foodConfirmPageSource).toContain('class="nutrition-section"');
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
    expect(foodConfirmPageSource).toContain('confirmRecognition');
    expect(foodConfirmPageSource).toContain('persistUserFoodPhoto');
    expect(foodConfirmPageSource).toContain('result.userFoodId');
    expect(foodConfirmPageSource).toContain('result.savedToLibrary');
    expect(foodConfirmPageSource).toContain('保存到我的食物并记下这餐');
    expect(foodConfirmPageSource).toContain('已保存到我的食物');
  });

  it('shows a recoverable error instead of an endless loading label', () => {
    expect(foodConfirmPageSource).toContain('v-else-if="loadError"');
    expect(foodConfirmPageSource).toContain('重新识别');
    expect(foodConfirmPageSource).toContain('recognitionCandidateToFood');
  });

  it('lets photo results correct dish name and component portions before saving', () => {
    expect(foodConfirmPageSource).toContain('v-model="foodName"');
    expect(foodConfirmPageSource).toContain('v-for="(component, index) in components"');
    expect(foodConfirmPageSource).toContain('recalculateFromComponents');
    expect(foodConfirmPageSource).toContain('estimatedEnergyKcal: preview.energyKcal');
  });
});
