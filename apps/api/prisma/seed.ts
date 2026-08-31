import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { slug: 'staple', name: '主食', sortOrder: 1 },
  { slug: 'protein', name: '肉蛋豆奶', sortOrder: 2 },
  { slug: 'vegetable', name: '蔬菜', sortOrder: 3 },
  { slug: 'fruit', name: '水果', sortOrder: 4 },
  { slug: 'dairy', name: '奶类', sortOrder: 5 },
  { slug: 'nut', name: '坚果', sortOrder: 6 },
] as const;

const foods = [
  {
    category: 'staple',
    name: '米饭',
    aliases: ['白米饭'],
    nutrition: {
      energyKcal: 116,
      proteinG: 2.6,
      fatG: 0.3,
      carbohydrateG: 25.9,
      dietaryFiberG: 0.3,
      sodiumMg: 2,
    },
    servings: [
      ['小碗', 150],
      ['大碗', 220],
    ],
  },
  {
    category: 'protein',
    name: '鸡蛋',
    aliases: ['水煮蛋'],
    nutrition: {
      energyKcal: 144,
      proteinG: 13.3,
      fatG: 8.8,
      carbohydrateG: 2.8,
      dietaryFiberG: 0,
      sodiumMg: 131,
    },
    servings: [['一个', 50]],
  },
  {
    category: 'protein',
    name: '嫩豆腐',
    aliases: ['豆腐'],
    nutrition: {
      energyKcal: 57,
      proteinG: 6.2,
      fatG: 2.5,
      carbohydrateG: 2.0,
      dietaryFiberG: 0.5,
      sodiumMg: 7,
    },
    servings: [
      ['半盒', 150],
      ['一盒', 300],
    ],
  },
  {
    category: 'protein',
    name: '鸡胸肉',
    aliases: ['鸡胸'],
    nutrition: {
      energyKcal: 133,
      proteinG: 24.6,
      fatG: 3.5,
      carbohydrateG: 0,
      dietaryFiberG: 0,
      sodiumMg: 46,
    },
    servings: [['一掌心', 100]],
  },
  {
    category: 'vegetable',
    name: '西兰花',
    aliases: ['绿花菜'],
    nutrition: {
      energyKcal: 34,
      proteinG: 2.8,
      fatG: 0.4,
      carbohydrateG: 6.6,
      dietaryFiberG: 2.6,
      sodiumMg: 33,
    },
    servings: [['一小碗', 150]],
  },
  {
    category: 'fruit',
    name: '香蕉',
    aliases: ['香蕉果肉'],
    nutrition: {
      energyKcal: 93,
      proteinG: 1.4,
      fatG: 0.2,
      carbohydrateG: 22.0,
      dietaryFiberG: 1.2,
      sodiumMg: 1,
    },
    servings: [['一根', 100]],
  },
  {
    category: 'vegetable', name: '番茄', aliases: ['西红柿'],
    nutrition: { energyKcal: 20, proteinG: 0.9, fatG: 0.2, carbohydrateG: 3.9, dietaryFiberG: 1.2, sodiumMg: 5 },
    servings: [['一个', 150]],
  },
  {
    category: 'vegetable', name: '黄瓜', aliases: ['青瓜'],
    nutrition: { energyKcal: 16, proteinG: 0.8, fatG: 0.2, carbohydrateG: 2.9, dietaryFiberG: 0.5, sodiumMg: 2 },
    servings: [['一根', 150]],
  },
  {
    category: 'vegetable', name: '菠菜', aliases: ['叶菜'],
    nutrition: { energyKcal: 28, proteinG: 2.6, fatG: 0.3, carbohydrateG: 4.5, dietaryFiberG: 2.2, sodiumMg: 85 },
    servings: [['一小碗', 100]],
  },
  {
    category: 'vegetable', name: '胡萝卜', aliases: ['红萝卜'],
    nutrition: { energyKcal: 41, proteinG: 0.9, fatG: 0.2, carbohydrateG: 9.6, dietaryFiberG: 2.8, sodiumMg: 69 },
    servings: [['一根', 100]],
  },
  {
    category: 'staple', name: '红薯', aliases: ['地瓜'],
    nutrition: { energyKcal: 86, proteinG: 1.6, fatG: 0.1, carbohydrateG: 20.1, dietaryFiberG: 3, sodiumMg: 55 },
    servings: [['一根', 150]],
  },
  {
    category: 'staple', name: '玉米', aliases: ['鲜玉米'],
    nutrition: { energyKcal: 112, proteinG: 4, fatG: 1.2, carbohydrateG: 22.8, dietaryFiberG: 2.9, sodiumMg: 1 },
    servings: [['一根', 200]],
  },
  {
    category: 'staple', name: '全麦面包', aliases: ['全麦吐司'],
    nutrition: { energyKcal: 246, proteinG: 8.5, fatG: 3.5, carbohydrateG: 46, dietaryFiberG: 6.9, sodiumMg: 420 },
    servings: [['两片', 60]],
  },
  {
    category: 'staple', name: '面条', aliases: ['挂面'],
    nutrition: { energyKcal: 137, proteinG: 4.5, fatG: 1.5, carbohydrateG: 27.5, dietaryFiberG: 1.5, sodiumMg: 5 },
    servings: [['一碗', 180]],
  },
  {
    category: 'protein', name: '三文鱼', aliases: ['鲑鱼'],
    nutrition: { energyKcal: 139, proteinG: 20.5, fatG: 6.5, carbohydrateG: 0, dietaryFiberG: 0, sodiumMg: 59 },
    servings: [['一块', 120]],
  },
  {
    category: 'protein', name: '牛肉', aliases: ['瘦牛肉'],
    nutrition: { energyKcal: 125, proteinG: 20.2, fatG: 4.2, carbohydrateG: 0, dietaryFiberG: 0, sodiumMg: 53 },
    servings: [['一掌心', 100]],
  },
  {
    category: 'protein', name: '虾仁', aliases: ['虾'],
    nutrition: { energyKcal: 93, proteinG: 18.6, fatG: 1.7, carbohydrateG: 1.5, dietaryFiberG: 0, sodiumMg: 111 },
    servings: [['一小碗', 100]],
  },
  {
    category: 'protein', name: '豆浆', aliases: ['无糖豆浆'],
    nutrition: { energyKcal: 31, proteinG: 3, fatG: 1.6, carbohydrateG: 1.2, dietaryFiberG: 1.1, sodiumMg: 3 },
    servings: [['一杯', 250]],
  },
  {
    category: 'dairy', name: '无糖酸奶', aliases: ['酸奶'],
    nutrition: { energyKcal: 72, proteinG: 3.5, fatG: 3.3, carbohydrateG: 6.5, dietaryFiberG: 0, sodiumMg: 55 },
    servings: [['一杯', 200]],
  },
  {
    category: 'nut', name: '核桃', aliases: ['核桃仁'],
    nutrition: { energyKcal: 646, proteinG: 14.9, fatG: 58.8, carbohydrateG: 18, dietaryFiberG: 9.5, sodiumMg: 4 },
    servings: [['三颗', 30]],
  },
  {
    category: 'nut', name: '杏仁', aliases: ['巴旦木'],
    nutrition: { energyKcal: 578, proteinG: 21.3, fatG: 49.4, carbohydrateG: 19.1, dietaryFiberG: 11.2, sodiumMg: 31 },
    servings: [['一小把', 25]],
  },
] as const;

async function main() {
  const categoryIds = new Map<string, string>();
  for (const category of categories) {
    const saved = await prisma.foodCategory.upsert({
      where: { slug: category.slug },
      create: category,
      update: { name: category.name, sortOrder: category.sortOrder, isActive: true },
    });
    categoryIds.set(category.slug, saved.id);
  }
  for (const food of foods) {
    const categoryId = categoryIds.get(food.category);
    if (!categoryId) throw new Error(`Missing seed category: ${food.category}`);
    const saved = await prisma.foodItem.upsert({
      where: { id: `seed-${food.category}-${food.name}` },
      create: {
        id: `seed-${food.category}-${food.name}`,
        name: food.name,
        categoryId,
        healthLight: 1,
      },
      update: { name: food.name, categoryId, healthLight: 1, isActive: true },
    });
    await prisma.foodNutrition.upsert({
      where: { foodId: saved.id },
      create: { foodId: saved.id, basisGrams: 100, ...food.nutrition },
      update: { basisGrams: 100, ...food.nutrition },
    });
    for (const alias of food.aliases)
      await prisma.foodAlias.upsert({
        where: { foodId_alias: { foodId: saved.id, alias } },
        create: { foodId: saved.id, alias },
        update: {},
      });
    for (const [label, grams] of food.servings)
      await prisma.foodServing.upsert({
        where: { foodId_label: { foodId: saved.id, label } },
        create: { foodId: saved.id, label, grams },
        update: { grams },
      });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
