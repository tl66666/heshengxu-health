export type NutritionPer100g = {
  energyKcal: number;
  proteinG: number;
  fatG: number;
  carbohydrateG: number;
  dietaryFiberG?: number | null;
  sodiumMg?: number | null;
};

export type CalculatedNutrition = {
  energyKcal: number;
  proteinG: number;
  fatG: number;
  carbohydrateG: number;
  dietaryFiberG: number | null;
  sodiumMg: number | null;
};

export function calculateNutritionForGrams(
  nutrition: NutritionPer100g,
  grams: number,
): CalculatedNutrition {
  if (!Number.isFinite(grams) || grams <= 0) throw new Error('grams must be greater than zero');
  const multiplier = grams / 100;
  const scale = (value: number) => Math.round(value * multiplier * 10) / 10;
  return {
    energyKcal: scale(nutrition.energyKcal),
    proteinG: scale(nutrition.proteinG),
    fatG: scale(nutrition.fatG),
    carbohydrateG: scale(nutrition.carbohydrateG),
    dietaryFiberG:
      nutrition.dietaryFiberG === null || nutrition.dietaryFiberG === undefined
        ? null
        : scale(nutrition.dietaryFiberG),
    sodiumMg: nutrition.sodiumMg === null || nutrition.sodiumMg === undefined ? null : scale(nutrition.sodiumMg),
  };
}
