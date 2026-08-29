/**
 * 食物数据导入脚本
 * 从 food.sql 导入到 Prisma 数据库
 * 
 * 使用方法：
 * pnpm tsx scripts/import-food-data.ts
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface SqlFoodRecord {
  id: number;
  category_id: number;
  code: string | null;
  name: string;
  thumb_image_url: string | null;
  is_liquid: number | null;
  health_light: number | null;
  weight: string | null;
  calory: string | null;
  protein: string | null;
  fat: string | null;
  carbohydrate: string | null;
  fiber_dietary: string | null;
  vitamin_a: string | null;
  thiamine: string | null;
  lactoflavin: string | null;
  vitamin_c: string | null;
  vitamin_e: string | null;
  niacin: string | null;
  natrium: string | null;
  calcium: string | null;
  iron: string | null;
  kalium: string | null;
  zinc: string | null;
  selenium: string | null;
  magnesium: string | null;
  copper: string | null;
  manganese: string | null;
  cholesterol: string | null;
  folacin: string | null;
  saturated_fat: string | null;
  sugar: string | null;
  vitamin_b6: string | null;
  phosphor: string | null;
  gi: string | null;
  gl: string | null;
}

// 1. 导入分类
async function importCategories() {
  console.log('📂 导入食物分类...');
  
  const categories = [
    { name: '主食类', slug: 'staple', sortOrder: 1, description: '包装谷薯、天然谷薯、谷薯制品' },
    { name: '肉蛋类', slug: 'meat-egg', sortOrder: 2, description: '白肉、红肉、蛋类' },
    { name: '大豆及制品', slug: 'soy', sortOrder: 3, description: '大豆及制品' },
    { name: '蔬菜菌藻类', slug: 'vegetable', sortOrder: 4, description: '菌藻、蔬菜' },
    { name: '水果类', slug: 'fruit', sortOrder: 5, description: '水果' },
    { name: '奶类', slug: 'dairy', sortOrder: 6, description: '鲜奶、酸奶、奶酪、奶粉、其它' },
    { name: '油脂类', slug: 'oil', sortOrder: 7, description: '植物油、动物油' },
    { name: '坚果类', slug: 'nut', sortOrder: 8, description: '坚果种子' },
    { name: '调味品', slug: 'seasoning', sortOrder: 9, description: '调味料、调味酱、酱菜、糖和蜂蜜' },
    { name: '饮料类', slug: 'beverage', sortOrder: 10, description: '酒精饮料、碳酸饮料、纯果蔬汁饮料、无糖茶饮、无糖咖啡、固体饮料、含糖饮料、乳饮料' },
    { name: '休闲零食', slug: 'snack', sortOrder: 11, description: '休闲零食' },
    { name: '餐饮食品', slug: 'restaurant', sortOrder: 12, description: '餐饮食品' },
  ];
  
  const categoryMap = new Map<number, string>();
  
  for (let i = 0; i < categories.length; i++) {
    const cat = await prisma.foodCategory.upsert({
      where: { slug: categories[i].slug },
      create: categories[i],
      update: categories[i],
    });
    categoryMap.set(i + 1, cat.id);
    console.log(`  ✓ ${categories[i].name}`);
  }
  
  console.log(`✅ 已导入 ${categories.length} 个分类\n`);
  return categoryMap;
}

// 2. 安全转换数值
function safeFloat(val: string | null): number | null {
  if (!val || val === '' || val === '0.0' || val === '0') return null;
  const num = parseFloat(val);
  return isNaN(num) || num === 0 ? null : num;
}

// 3. 简化的 SQL 解析（针对我们的 INSERT 格式）
function parseFoodSql(sqlContent: string): SqlFoodRecord[] {
  const records: SqlFoodRecord[] = [];
  
  // 匹配 INSERT INTO food (...) VALUES 行
  const lines = sqlContent.split('\n');
  let columns: string[] = [];
  let inValues = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // 找到列定义
    if (trimmed.startsWith('INSERT INTO food') && trimmed.includes('VALUES')) {
      const match = trimmed.match(/\(([^)]+)\)\s+VALUES/);
      if (match) {
        columns = match[1].split(',').map(c => c.trim());
        inValues = true;
      }
      continue;
    }
    
    // 解析值行
    if (inValues && trimmed.startsWith('(')) {
      const values = parseValueLine(trimmed);
      if (values.length === columns.length) {
        const record: any = {};
        columns.forEach((col, idx) => {
          record[col] = values[idx];
        });
        records.push(record);
      }
    }
    
    // 结束
    if (trimmed.endsWith(';')) {
      inValues = false;
    }
  }
  
  return records;
}

// 4. 解析单行值（简化版）
function parseValueLine(line: string): any[] {
  // 移除首尾括号和分号
  line = line.replace(/^\(/, '').replace(/\)[,;]?$/, '');
  
  const values: any[] = [];
  let current = '';
  let inQuote = false;
  let escapeNext = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (escapeNext) {
      current += char;
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    
    if (char === "'") {
      if (inQuote) {
        // 检查是否是转义的单引号
        if (i + 1 < line.length && line[i + 1] === "'") {
          current += "'";
          i++; // 跳过下一个引号
        } else {
          inQuote = false;
        }
      } else {
        inQuote = true;
      }
      continue;
    }
    
    if (char === ',' && !inQuote) {
      values.push(parseValue(current.trim()));
      current = '';
      continue;
    }
    
    current += char;
  }
  
  // 最后一个值
  if (current) {
    values.push(parseValue(current.trim()));
  }
  
  return values;
}

function parseValue(val: string): any {
  if (val === 'NULL' || val === '') return null;
  if (!isNaN(Number(val))) return Number(val);
  return val;
}

// 5. 导入食物数据（批量）
async function importFoods(
  categoryMap: Map<number, string>,
  batchSize = 500
) {
  console.log('🍽️  导入食物数据...');
  
  const sqlPath = path.join(__dirname, '../food.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
  
  console.log('📖 解析 SQL 文件...');
  const records = parseFoodSql(sqlContent);
  console.log(`📊 解析到 ${records.length} 条食物记录\n`);
  
  if (records.length === 0) {
    console.log('⚠️  未找到食物记录，请检查 food.sql 文件格式');
    return;
  }
  
  let imported = 0;
  let failed = 0;
  const failedRecords: any[] = [];
  
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    
    try {
      await prisma.$transaction(async (tx) => {
        for (const record of batch) {
          try {
            const categoryId = categoryMap.get(record.category_id);
            
            // 创建食物项
            const foodItem = await tx.foodItem.create({
              data: {
                name: record.name,
                categoryId: categoryId || null,
                pinyinCode: record.code,
                thumbImageUrl: record.thumb_image_url,
                isLiquid: record.is_liquid === 1,
                healthLight: record.health_light || 0,
                isActive: true,
              },
            });
            
            // 创建营养数据
            await tx.foodNutrition.create({
              data: {
                foodId: foodItem.id,
                basisGrams: 100,
                energyKcal: safeFloat(record.calory) || 0,
                proteinG: safeFloat(record.protein) || 0,
                fatG: safeFloat(record.fat) || 0,
                carbohydrateG: safeFloat(record.carbohydrate) || 0,
                dietaryFiberG: safeFloat(record.fiber_dietary),
                sodiumMg: safeFloat(record.natrium),
                
                // 维生素
                vitaminAUg: safeFloat(record.vitamin_a),
                thiamineMg: safeFloat(record.thiamine),
                riboflavinMg: safeFloat(record.lactoflavin),
                vitaminB6Mg: safeFloat(record.vitamin_b6),
                vitaminCMg: safeFloat(record.vitamin_c),
                vitaminEMg: safeFloat(record.vitamin_e),
                niacinMg: safeFloat(record.niacin),
                folateMcg: safeFloat(record.folacin),
                
                // 矿物质
                calciumMg: safeFloat(record.calcium),
                ironMg: safeFloat(record.iron),
                potassiumMg: safeFloat(record.kalium),
                zincMg: safeFloat(record.zinc),
                seleniumUg: safeFloat(record.selenium),
                magnesiumMg: safeFloat(record.magnesium),
                copperMg: safeFloat(record.copper),
                manganeseMg: safeFloat(record.manganese),
                phosphorusMg: safeFloat(record.phosphor),
                
                // 其他
                cholesterolMg: safeFloat(record.cholesterol),
                saturatedFatG: safeFloat(record.saturated_fat),
                sugarG: safeFloat(record.sugar),
                gi: safeFloat(record.gi),
                gl: safeFloat(record.gl),
              },
            });
            
            // 创建常见份量（如果有重量数据）
            const weight = safeFloat(record.weight);
            if (weight && weight > 0) {
              await tx.foodServing.create({
                data: {
                  foodId: foodItem.id,
                  label: '标准份',
                  grams: weight,
                },
              });
            }
            
            imported++;
          } catch (error) {
            failed++;
            failedRecords.push({ name: record.name, error: String(error) });
          }
        }
      }, {
        timeout: 60000, // 60秒超时
      });
      
      const progress = Math.round((imported + failed) / records.length * 100);
      process.stdout.write(`\r  进度：${imported + failed} / ${records.length} (${progress}%) - 成功: ${imported}, 失败: ${failed}`);
      
    } catch (error) {
      console.error(`\n❌ 批次导入失败：`, error);
      failed += batch.length;
    }
  }
  
  console.log(`\n\n✅ 导入完成！成功: ${imported}, 失败: ${failed}`);
  
  if (failedRecords.length > 0) {
    console.log('\n⚠️  失败记录（前10条）：');
    failedRecords.slice(0, 10).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
  }
  
  return { imported, failed };
}

// 6. 显示统计信息
async function showStats() {
  console.log('\n📊 导入统计：');
  
  const totalFoods = await prisma.foodItem.count();
  console.log(`  总食物数：${totalFoods}`);
  
  const stats = await prisma.foodItem.groupBy({
    by: ['categoryId'],
    _count: true,
  });
  
  console.log('\n  各分类食物数：');
  for (const stat of stats) {
    if (!stat.categoryId) {
      console.log(`    未分类: ${stat._count}`);
      continue;
    }
    
    const category = await prisma.foodCategory.findUnique({
      where: { id: stat.categoryId },
    });
    console.log(`    ${category?.name}: ${stat._count}`);
  }
  
  const totalNutrition = await prisma.foodNutrition.count();
  console.log(`\n  营养数据：${totalNutrition}`);
  
  const totalServings = await prisma.foodServing.count();
  console.log(`  份量数据：${totalServings}`);
}

// 主函数
async function main() {
  console.log('🚀 开始导入食物数据库...\n');
  console.log('⚠️  注意：此操作将导入大量数据，请确保数据库已准备就绪\n');
  
  try {
    // 检查是否已有数据
    const existingCount = await prisma.foodItem.count();
    if (existingCount > 0) {
      console.log(`⚠️  数据库中已有 ${existingCount} 条食物数据`);
      console.log('   如需重新导入，请先清空数据库或删除现有食物数据\n');
      
      // 询问是否继续（实际使用时需要交互式确认）
      // 这里简化处理，直接退出
      console.log('   跳过导入，使用现有数据');
      await showStats();
      return;
    }
    
    const categoryMap = await importCategories();
    const result = await importFoods(categoryMap);
    await showStats();
    
    console.log('\n🎉 全部完成！');
    
  } catch (error) {
    console.error('\n❌ 导入失败：', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 运行
main().catch(console.error);
