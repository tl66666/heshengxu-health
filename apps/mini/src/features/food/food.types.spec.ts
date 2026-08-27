import { describe, expect, it } from 'vitest';
import { calculateFoodNutrition, type FoodItem } from './food.types.js';

const food: FoodItem = {
  id: 'rice',
  name: '米饭',
  brand: null,
  category: null,
  nutrition: {
    basisGrams: 100,
    energyKcal: 116,
    proteinG: 2.6,
    fatG: 0.3,
    carbohydrateG: 25.9,
    dietaryFiberG: 0.3,
    sodiumMg: 2,
  },
  servings: [],
};

describe('food nutrition preview', () => {
  it('scales catalog nutrition by grams', () => {
    expect(calculateFoodNutrition(food, 150)).toEqual({
      energyKcal: 174,
      proteinG: 3.9,
      fatG: 0.5,
      carbohydrateG: 38.8,
    });
  });
  it('rejects an empty portion', () => {
    expect(() => calculateFoodNutrition(food, 0)).toThrow('份量需要大于 0 克');
  });
});
