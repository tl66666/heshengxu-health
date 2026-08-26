import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { slug: 'staple', name: '主食', sortOrder: 1 },
  { slug: 'protein', name: '肉蛋豆奶', sortOrder: 2 },
  { slug: 'vegetable', name: '蔬菜', sortOrder: 3 },
  { slug: 'fruit', name: '水果', sortOrder: 4 },
] as const;

const foods = [
  { category: 'staple', name: '米饭', aliases: ['白米饭'], nutrition: { energyKcal: 116, proteinG: 2.6, fatG: 0.3, carbohydrateG: 25.9, dietaryFiberG: 0.3, sodiumMg: 2 }, servings: [['小碗', 150], ['大碗', 220]] },
  { category: 'protein', name: '鸡蛋', aliases: ['水煮蛋'], nutrition: { energyKcal: 144, proteinG: 13.3, fatG: 8.8, carbohydrateG: 2.8, dietaryFiberG: 0, sodiumMg: 131 }, servings: [['一个', 50]] },
  { category: 'protein', name: '嫩豆腐', aliases: ['豆腐'], nutrition: { energyKcal: 57, proteinG: 6.2, fatG: 2.5, carbohydrateG: 2.0, dietaryFiberG: 0.5, sodiumMg: 7 }, servings: [['半盒', 150], ['一盒', 300]] },
  { category: 'protein', name: '鸡胸肉', aliases: ['鸡胸'], nutrition: { energyKcal: 133, proteinG: 24.6, fatG: 3.5, carbohydrateG: 0, dietaryFiberG: 0, sodiumMg: 46 }, servings: [['一掌心', 100]] },
  { category: 'vegetable', name: '西兰花', aliases: ['绿花菜'], nutrition: { energyKcal: 34, proteinG: 2.8, fatG: 0.4, carbohydrateG: 6.6, dietaryFiberG: 2.6, sodiumMg: 33 }, servings: [['一小碗', 150]] },
  { category: 'fruit', name: '香蕉', aliases: ['香蕉果肉'], nutrition: { energyKcal: 93, proteinG: 1.4, fatG: 0.2, carbohydrateG: 22.0, dietaryFiberG: 1.2, sodiumMg: 1 }, servings: [['一根', 100]] },
] as const;

async function main() {
  const categoryIds = new Map<string, string>();
  for (const category of categories) {
    const saved = await prisma.foodCategory.upsert({ where: { slug: category.slug }, create: category, update: { name: category.name, sortOrder: category.sortOrder, isActive: true } });
    categoryIds.set(category.slug, saved.id);
  }
  for (const food of foods) {
    const categoryId = categoryIds.get(food.category);
    if (!categoryId) throw new Error(`Missing seed category: ${food.category}`);
    const saved = await prisma.foodItem.upsert({ where: { id: `seed-${food.category}-${food.name}` }, create: { id: `seed-${food.category}-${food.name}`, name: food.name, categoryId }, update: { name: food.name, categoryId, isActive: true } });
    await prisma.foodNutrition.upsert({ where: { foodId: saved.id }, create: { foodId: saved.id, basisGrams: 100, ...food.nutrition }, update: { basisGrams: 100, ...food.nutrition } });
    for (const alias of food.aliases) await prisma.foodAlias.upsert({ where: { foodId_alias: { foodId: saved.id, alias } }, create: { foodId: saved.id, alias }, update: {} });
    for (const [label, grams] of food.servings) await prisma.foodServing.upsert({ where: { foodId_label: { foodId: saved.id, label } }, create: { foodId: saved.id, label, grams }, update: { grams } });
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
