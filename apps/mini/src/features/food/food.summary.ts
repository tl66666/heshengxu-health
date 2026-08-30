import type { MealType } from './food.types.js';

export type MealEntry = {
  id: string;
  mealType: MealType;
  foodId: string | null;
  userFoodId?: string | null;
  foodNameSnapshot: string;
  grams: number;
  energyKcal: number;
  proteinG: number;
  fatG: number;
  carbohydrateG: number;
  recordedAt: string;
  note?: string | null;
};

export function summarizeFoodEntries(entries: readonly MealEntry[]) {
  return entries.reduce(
    (summary, entry) => ({
      energyKcal: Math.round((summary.energyKcal + entry.energyKcal) * 10) / 10,
      proteinG: Math.round((summary.proteinG + entry.proteinG) * 10) / 10,
      fatG: Math.round((summary.fatG + entry.fatG) * 10) / 10,
      carbohydrateG: Math.round((summary.carbohydrateG + entry.carbohydrateG) * 10) / 10,
    }),
    { energyKcal: 0, proteinG: 0, fatG: 0, carbohydrateG: 0 },
  );
}
