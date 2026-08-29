/**
 * 简化版食物数据导入脚本
 * 使用正则表达式直接解析 food.sql 的 VALUES 行
 * 
 * 使用方法：
 * cd apps/api
 * pnpm tsx ../../scripts/import-food-data-simple.ts
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// 分类映射
const CATEGORY_MAP = [
  { id: 1, name: '主食类', slug: 'staple' },
  { id: 2, name: '肉蛋类', slug: 'meat-egg' },
  { id: 3, name: '大豆及制品', slug: 'soy' },
  { id: 4, name: '蔬菜菌藻类', slug: 'vegetable' },
  { id: 5, name: '水果类', slug: 'fruit' },
  { id: 6, name: '奶类', slug: 'dairy' },
  { id: 7, name: '油脂类', slug: 'oil' },
  { id: 8, name: '坚果类', slug: 'nut' },
  { id: 9, name: '调味品', slug: 'seasoning' },
  { id: 10, name: '饮料类', slug: 'beverage' },
  { id: 11, name: '休闲零食', slug: 'snack' },
  { id: 12, name: '餐饮食品', slug: 'restaurant' },
];

// 安全转换数值
function safeFloat(val: any): number | null {
  if (val === null || val === undefined || val === '' || val === '0.0') return null;
  const num = parseFloat(val);
  return isNaN(num) || num === 0 ? null : num;
}

// 1. 导入分类
async function importCategories() {
  console.log('📂 导入食物分类...\n');
  
  const categoryMap = new Map<number, string>();
  
  for (const cat of CATEGORY_MAP) {
    const created = await prisma.foodCategory.upsert({
      where: { slug: cat.slug },
      create: {
        name: cat.name,
        slug: cat.slug,
        sortOrder: cat.id,
      },
      update: {
        name: cat.name,
        sortOrder: cat.id,
      },
    });
    categoryMap.set(cat.id, created.id);
    console.log(`  ✓ ${cat.name}`);
  }
  
  console.log(`\n✅ 已导入 ${CATEGORY_MAP.length} 个分类\n`);
  return categoryMap;
}

// 2. 解析单行 VALUES
function parseValueRow(line: string): any[] {
  // 移除首尾括号
  line = line.trim().replace(/^\(/, '').replace(/\)[,;]?$/, '');
  
  const values: any[] = [];
  let current = '';
  let inQuote = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === "'" && !inQuote) {
      inQuote = true;
      continue;
    }
    
    if (char === "'" && inQuote) {
      // 检查是否是转义的单引号 ''
      if (nextChar === "'") {
        current += "'";
        i++; // 跳过下一个
        continue;
      }
      inQuote = false;
      continue;
    }
    
    if (char === ',' && !inQuote) {
      values.push(current.trim() || null);
      current = '';
      continue;
    }
    
    current += char;
  }
  
  // 最后一个值
  if (current.trim()) {
    values.push(current.trim());
  }
  
  return values;
}

// 3. 导入食物数据
async function importFoods(categoryMap: Map<number, string>) {
  console.log('🍽️  开始导入食物数据...\n');
  
  const sqlPath = path.join(__dirname, '../food.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
  
  // 提取所有 VALUES 行
  const lines = sqlContent.split('\n');
  const valueRows: string[] = [];
  let capturing = false;
  
  for (const line of lines) {
    if (line.includes('INSERT INTO food') && line.includes('VALUES')) {
      capturing = true;
      // 检查是否同行就有值
      const match = line.match(/VALUES\s*(.+)/);
      if (match) {
        const valuesContent = match[1].trim();
        if (valuesContent.startsWith('(')) {
          valueRows.push(valuesContent);
        }
      }
      continue;
    }
    
    if (capturing) {
      const trimmed = line.trim();
      if (trimmed.startsWith('(')) {
        valueRows.push(trimmed);
      }
      // 检查是否结束
      if (trimmed.endsWith(';')) {
        capturing = false;
      }
    }
  }
  
  console.log(`📊 找到 ${valueRows.length} 行数据\n`);
  
  // 批量导入
  let imported = 0;
  let failed = 0;
  const batchSize = 100;
  
  for (let i = 0; i < valueRows.length; i += batchSize) {
    const batch = valueRows.slice(i, i + batchSize);
    
    try {
      await prisma.$transaction(async (tx) => {
        for (const row of batch) {
          try {
            const values = parseValueRow(row);
            
            if (values.length < 35) {
              console.warn(`  ⚠️  跳过不完整的行 (${values.length} 个字段)`);
              failed++;
              continue;
            }
            
            // 映射字段（按 INSERT 语句的列顺序）
            const [
              category_id, code, name, thumb_image_url, is_liquid, health_light,
              weight, calory, fat, protein, fiber_dietary, carbohydrate,
              vitamin_a, thiamine, lactoflavin, vitamin_c, vitamin_e, niacin,
              natrium, calcium, iron, kalium, zinc, selenium, magnesium, copper,
              manganese, cholesterol, folacin, saturated_fat, sugar, vitamin_b6,
              phosphor, gi, gl
            ] = values;
            
            const categoryId = categoryMap.get(Number(category_id));
            
            // 创建食物
            const food = await tx.foodItem.create({
              data: {
                name: String(name),
                categoryId: categoryId || null,
                pinyinCode: code || null,
                thumbImageUrl: thumb_image_url || null,
                isLiquid: is_liquid === '1',
                healthLight: Number(health_light) || 0,
                isActive: true,
              },
            });
            
            // 创建营养数据
            await tx.foodNutrition.create({
              data: {
                foodId: food.id,
                basisGrams: 100,
                energyKcal: safeFloat(calory) || 0,
                proteinG: safeFloat(protein) || 0,
                fatG: safeFloat(fat) || 0,
                carbohydrateG: safeFloat(carbohydrate) || 0,
                dietaryFiberG: safeFloat(fiber_dietary),
                sodiumMg: safeFloat(natrium),
                
                // 维生素
                vitaminAUg: safeFloat(vitamin_a),
                thiamineMg: safeFloat(thiamine),
                riboflavinMg: safeFloat(lactoflavin),
                vitaminB6Mg: safeFloat(vitamin_b6),
                vitaminCMg: safeFloat(vitamin_c),
                vitaminEMg: safeFloat(vitamin_e),
                niacinMg: safeFloat(niacin),
                folateMcg: safeFloat(folacin),
                
                // 矿物质
                calciumMg: safeFloat(calcium),
                ironMg: safeFloat(iron),
                potassiumMg: safeFloat(kalium),
                zincMg: safeFloat(zinc),
                seleniumUg: safeFloat(selenium),
                magnesiumMg: safeFloat(magnesium),
                copperMg: safeFloat(copper),
                manganeseMg: safeFloat(manganese),
                phosphorusMg: safeFloat(phosphor),
                
                // 其他
                cholesterolMg: safeFloat(cholesterol),
                saturatedFatG: safeFloat(saturated_fat),
                sugarG: safeFloat(sugar),
                gi: safeFloat(gi),
                gl: safeFloat(gl),
              },
            });
            
            // 创建常见份量
            const weightGrams = safeFloat(weight);
            if (weightGrams && weightGrams > 0) {
              await tx.foodServing.create({
                data: {
                  foodId: food.id,
                  label: '标准份',
                  grams: weightGrams,
                },
              });
            }
            
            imported++;
          } catch (err) {
            failed++;
            if (failed <= 5) {
              console.error(`  ❌ 导入失败:`, err instanceof Error ? err.message : err);
            }
          }
        }
      }, {
        timeout: 120000, // 2分钟超时
      });
      
      // 显示进度
      const progress = Math.round((imported + failed) / valueRows.length * 100);
      process.stdout.write(`\r  进度: ${imported + failed}/${valueRows.length} (${progress}%) - 成功: ${imported}, 失败: ${failed}`);
      
    } catch (err) {
      console.error(`\n❌ 批次失败:`, err);
      failed += batch.length;
    }
  }
  
  console.log(`\n\n✅ 导入完成！成功: ${imported}, 失败: ${failed}\n`);
  return { imported, failed };
}

// 4. 显示统计
async function showStats() {
  console.log('📊 数据统计：\n');
  
  const totalFoods = await prisma.foodItem.count();
  console.log(`  总食物数: ${totalFoods}`);
  
  const totalNutrition = await prisma.foodNutrition.count();
  console.log(`  营养数据: ${totalNutrition}`);
  
  const totalServings = await prisma.foodServing.count();
  console.log(`  份量数据: ${totalServings}`);
  
  console.log('\n  分类统计:');
  const stats = await prisma.foodItem.groupBy({
    by: ['categoryId'],
    _count: true,
  });
  
  for (const stat of stats) {
    if (!stat.categoryId) continue;
    const cat = await prisma.foodCategory.findUnique({
      where: { id: stat.categoryId },
    });
    console.log(`    ${cat?.name}: ${stat._count}`);
  }
}

// 主函数
async function main() {
  console.log('🚀 食物数据库导入工具\n');
  console.log('=' .repeat(50) + '\n');
  
  try {
    // 检查现有数据
    const existingCount = await prisma.foodItem.count();
    if (existingCount > 0) {
      console.log(`⚠️  数据库中已有 ${existingCount} 条食物数据`);
      console.log('   跳过导入，显示当前统计:\n');
      await showStats();
      return;
    }
    
    // 执行导入
    const categoryMap = await importCategories();
    await importFoods(categoryMap);
    await showStats();
    
    console.log('\n' + '=' .repeat(50));
    console.log('🎉 全部完成！\n');
    
  } catch (error) {
    console.error('\n❌ 发生错误：', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 运行
main();
