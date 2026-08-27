import { describe, expect, it } from 'vitest';
import { calculateNutritionForGrams } from './nutrition.js';

describe('nutrition calculation', () => {
  const per100g = {
    energyKcal: 120,
    proteinG: 8,
    fatG: 4,
    carbohydrateG: 12,
    dietaryFiberG: 3,
    sodiumMg: 100,
  };

  it('scales a 100 gram nutrition basis to the confirmed grams', () => {
    expect(calculateNutritionForGrams(per100g, 150)).toEqual({
      energyKcal: 180,
      proteinG: 12,
      fatG: 6,
      carbohydrateG: 18,
      dietaryFiberG: 4.5,
      sodiumMg: 150,
    });
  });

  it('rejects zero and negative grams', () => {
    expect(() => calculateNutritionForGrams(per100g, 0)).toThrow('grams must be greater than zero');
    expect(() => calculateNutritionForGrams(per100g, -10)).toThrow(
      'grams must be greater than zero',
    );
  });
});
