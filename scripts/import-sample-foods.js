/**
 * 简化版食物数据导入 - 纯JS版本
 * 只导入少量示例数据用于测试
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// 示例食物数据
const SAMPLE_FOODS = [
  { category: 1, name: '米饭', code: 'mifan', calories: 116, protein: 2.6, fat: 0.3, carbs: 25.9 },
  { category: 1, name: '馒头', code: 'mantou', calories: 223, protein: 7.0, fat: 1.1, carbs: 47.0 },
  { category: 1, name: '面条', code: 'miantiao', calories: 137, protein: 4.5, fat: 0.5, carbs: 28.0 },
  { category: 2, name: '鸡胸肉', code: 'jixiongrou', calories: 133, protein: 19.4, fat: 5.0, carbs: 2.5 },
  { category: 2, name: '鸡蛋', code: 'jidan', calories: 144, protein: 13.3, fat: 8.8, carbs: 2.8 },
  { category: 2, name: '牛肉', code: 'niurou', calories: 125, protein: 20.0, fat: 4.2, carbs: 0 },
  { category: 3, name: '豆腐', code: 'doufu', calories: 81, protein: 8.1, fat: 3.7, carbs: 4.2 },
  { category: 3, name: '豆浆', code: 'doujiang', calories: 31, protein: 3.0, fat: 1.8, carbs: 1.1 },
  { category: 4, name: '西兰花', code: 'xilanhua', calories: 34, protein: 4.1, fat: 0.6, carbs: 4.3 },
  { category: 4, name: '番茄', code: 'fanqie', calories: 19, protein: 0.9, fat: 0.2, carbs: 3.3 },
  { category: 4, name: '黄瓜', code: 'huanggua', calories: 15, protein: 0.8, fat: 0.2, carbs: 2.9 },
  { category: 5, name: '苹果', code: 'pingguo', calories: 52, protein: 0.2, fat: 0.2, carbs: 13.5 },
  { category: 5, name: '香蕉', code: 'xiangjiao', calories: 93, protein: 1.4, fat: 0.2, carbs: 22.0 },
  { category: 5, name: '橙子', code: 'chengzi', calories: 47, protein: 0.9, fat: 0.1, carbs: 11.8 },
  { category: 6, name: '牛奶', code: 'niunai', calories: 54, protein: 3.0, fat: 3.2, carbs: 3.4 },
  { category: 6, name: '酸奶', code: 'suannai', calories: 72, protein: 2.5, fat: 2.7, carbs: 9.3 },
];

async function main() {
  console.log('🚀 导入示例食物数据\n');
  
  try {
    // 1. 导入分类
    console.log('📂 导入分类...');
    const categories = [
      { name: '主食类', slug: 'staple', sortOrder: 1 },
      { name: '肉蛋类', slug: 'meat-egg', sortOrder: 2 },
      { name: '大豆及制品', slug: 'soy', sortOrder: 3 },
      { name: '蔬菜菌藻类', slug: 'vegetable', sortOrder: 4 },
      { name: '水果类', slug: 'fruit', sortOrder: 5 },
      { name: '奶类', slug: 'dairy', sortOrder: 6 },
    ];
    
    const categoryMap = new Map();
    for (let i = 0; i < categories.length; i++) {
      const cat = await prisma.foodCategory.upsert({
        where: { slug: categories[i].slug },
        create: categories[i],
        update: categories[i]
      });
      categoryMap.set(i + 1, cat.id);
      console.log(`  ✓ ${cat.name}`);
    }
    console.log(`✅ ${categories.length} 个分类\n`);
    
    // 2. 导入示例食物
    console.log('💾 导入示例食物...');
    let imported = 0;
    
    for (const food of SAMPLE_FOODS) {
      try {
        const categoryId = categoryMap.get(food.category);
        
        const foodItem = await prisma.foodItem.create({
          data: {
            name: food.name,
            categoryId: categoryId,
            pinyinCode: food.code,
            isLiquid: false,
            healthLight: 1,
            isActive: true
          }
        });
        
        await prisma.foodNutrition.create({
          data: {
            foodId: foodItem.id,
            basisGrams: 100,
            energyKcal: food.calories,
            proteinG: food.protein,
            fatG: food.fat,
            carbohydrateG: food.carbs,
          }
        });
        
        await prisma.foodServing.create({
          data: {
            foodId: foodItem.id,
            label: '标准份',
            grams: 100
          }
        });
        
        imported++;
        console.log(`  ✓ ${food.name} (${food.calories}千卡)`);
      } catch (err) {
        console.error(`  ✗ ${food.name}: ${err.message}`);
      }
    }
    
    console.log(`\n✅ 导入完成！共 ${imported} 条食物\n`);
    
    // 3. 统计
    const total = await prisma.foodItem.count();
    console.log(`📊 数据库中共有 ${total} 条食物\n`);
    
    console.log('🎉 完成！\n');
    
  } catch (error) {
    console.error('❌ 错误：', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
