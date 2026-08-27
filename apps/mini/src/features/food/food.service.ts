import { createMiniApiClient } from '../../services/mini-api.js';
import type { FoodItem, MealType } from './food.types.js';
import type { MealEntry } from './food.summary.js';

export function searchFoods(query = '') {
  return createMiniApiClient().get<FoodItem[]>(`/foods/search?q=${encodeURIComponent(query)}`);
}

export function createMealEntry(input: {
  mealType: MealType;
  foodId: string;
  grams: number;
  recordedAt: string;
  note?: string;
}) {
  return createMiniApiClient().post('/meal-entries', input);
}

export function loadMealEntries(date: string) {
  return createMiniApiClient().get<MealEntry[]>(`/meal-entries?date=${encodeURIComponent(date)}`);
}

export function replaceMealEntry(
  recordId: string,
  input: {
    mealType?: MealType;
    foodId?: string;
    grams?: number;
    recordedAt?: string;
    note?: string;
  },
) {
  return createMiniApiClient().patch(`/meal-entries/${encodeURIComponent(recordId)}`, input);
}

export function deleteMealEntry(recordId: string) {
  return createMiniApiClient().delete(`/meal-entries/${encodeURIComponent(recordId)}`);
}
