import fs from 'node:fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const output = 'apps/mini/src/features/food/local-food-catalog.generated.ts';

const foods = await prisma.foodItem.findMany({
  where: { isActive: true },
  include: { category: true, nutrition: true, servings: true },
  orderBy: [{ catalogRank: 'desc' }, { name: 'asc' }],
});

const items = foods.map((food) => ({
  id: `local-${food.id}`,
  name: food.name,
  brand: food.brand,
  category: food.category
    ? { id: food.category.id, name: food.category.name, slug: food.category.slug }
    : null,
  nutrition: food.nutrition
    ? {
        basisGrams: food.nutrition.basisGrams,
        energyKcal: food.nutrition.energyKcal,
        proteinG: food.nutrition.proteinG,
        fatG: food.nutrition.fatG,
        carbohydrateG: food.nutrition.carbohydrateG,
        dietaryFiberG: food.nutrition.dietaryFiberG,
        sodiumMg: food.nutrition.sodiumMg,
      }
    : null,
  servings: food.servings.map((serving) => ({
    id: `local-${food.id}-${serving.id}`,
    label: serving.label,
    grams: serving.grams,
  })),
  healthLight: food.healthLight,
}));

fs.writeFileSync(
  output,
  `import type { FoodItem } from './food.types.js';\n\nexport const GENERATED_LOCAL_FOOD_CATALOG: FoodItem[] = ${JSON.stringify(items, null, 2)};\n`,
  'utf8',
);
console.log(`Exported ${items.length} foods to ${output}`);
await prisma.$disconnect();
