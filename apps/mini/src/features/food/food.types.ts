export type FoodNutrition = {
  basisGrams: 100;
  energyKcal: number;
  proteinG: number;
  fatG: number;
  carbohydrateG: number;
  dietaryFiberG: number | null;
  sodiumMg: number | null;
};

export type FoodServing = { id: string; label: string; grams: number };
export type FoodItem = {
  id: string;
  name: string;
  brand: string | null;
  category: { id: string; name: string; slug: string } | null;
  nutrition: FoodNutrition;
  servings: FoodServing[];
};

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export function calculateFoodNutrition(food: FoodItem, grams: number) {
  if (!Number.isFinite(grams) || grams <= 0) throw new Error('份量需要大于 0 克');
  const scale = grams / food.nutrition.basisGrams;
  const round = (value: number) => Math.round(value * scale * 10) / 10;
  return {
    energyKcal: round(food.nutrition.energyKcal),
    proteinG: round(food.nutrition.proteinG),
    fatG: round(food.nutrition.fatG),
    carbohydrateG: round(food.nutrition.carbohydrateG),
  };
}
