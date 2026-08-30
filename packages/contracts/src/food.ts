import type { MealType } from './health-loop.js';

export type FoodNutritionDto = {
  basisGrams: 100;
  energyKcal: number;
  proteinG: number;
  fatG: number;
  carbohydrateG: number;
  dietaryFiberG: number | null;
  sodiumMg: number | null;
};

export type FoodServingDto = {
  id: string;
  label: string;
  grams: number;
};

export type FoodItemDto = {
  id: string;
  name: string;
  brand: string | null;
  category: { id: string; name: string; slug: string } | null;
  nutrition: FoodNutritionDto;
  servings: FoodServingDto[];
};

export type MealEntryNutritionSnapshot = FoodNutritionDto & {
  foodName: string;
  grams: number;
  calculatedAt: string;
};

export type MealEntryDto = {
  id: string;
  mealType: MealType;
  foodId: string | null;
  userFoodId: string | null;
  foodNameSnapshot: string;
  grams: number;
  nutritionSnapshot: MealEntryNutritionSnapshot;
  source: 'manual' | 'photo_confirmed';
  recordedAt: string;
  note: string | null;
};

export type CreateMealEntryRequest = {
  mealType: MealType;
  foodId?: string;
  userFoodId?: string;
  grams: number;
  recordedAt: string;
  note?: string;
  source?: 'manual' | 'photo_confirmed';
};
