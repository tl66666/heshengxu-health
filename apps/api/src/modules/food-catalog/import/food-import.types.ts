export type FoodImportRow = {
  name: string;
  categoryName?: string | null;
  brand?: string | null;
  energyKcal: number;
  proteinG: number;
  fatG: number;
  carbohydrateG: number;
  dietaryFiberG?: number | null;
  sodiumMg?: number | null;
  aliases?: string[];
  servings?: Array<{ label: string; grams: number }>;
};

export type FoodImportLicense = {
  sourceName: string;
  sourceLicense: string;
  sourceVersion?: string;
};
