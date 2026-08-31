/**
 * 精简版食物数据导入 - 只导入常见食物
 * 约500-1000条核心数据
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

const prisma = new PrismaClient();

// 常见食物关键词（用于筛选）
const COMMON_FOODS = [
  // 主食
  '米饭', '面条', '馒头', '面包', '包子', '饺子', '馄饨', '粥', '燕麦', '玉米',
  '红薯', '紫薯', '土豆', '山药', '年糕', '粉丝', '意面', '披萨', '汉堡',
  
  // 肉类
  '鸡胸肉', '鸡腿', '鸡翅', '猪肉', '牛肉', '羊肉', '鱼', '虾', '蟹', '鸡蛋',
  '鸭蛋', '鹌鹑蛋', '培根', '火腿', '香肠', '鸡排', '牛排', '三文鱼', '鳕鱼',
  
  // 豆制品
  '豆腐', '豆浆', '豆干', '腐竹', '豆皮', '豆腐脑', '千张', '豆芽',
  
  // 蔬菜
  '白菜', '西兰花', '菠菜', '生菜', '油菜', '芹菜', '黄瓜', '番茄', '茄子',
  '青椒', '胡萝卜', '洋葱', '大蒜', '生姜', '土豆', '莲藕', '冬瓜', '南瓜',
  '玉米', '豌豆', '四季豆', '豆角', '芦笋', '西葫芦', '苦瓜', '丝瓜',
  
  // 水果
  '苹果', '香蕉', '橙子', '柚子', '葡萄', '西瓜', '草莓', '蓝莓', '猕猴桃',
  '芒果', '火龙果', '梨', '桃子', '李子', '樱桃', '荔枝', '龙眼', '柿子',
  '石榴', '菠萝', '木瓜', '柠檬', '椰子', '牛油果',
  
  // 奶制品
  '牛奶', '酸奶', '奶酪', '奶粉', '炼乳', '奶油', '黄油',
  
  // 坚果
  '核桃', '杏仁', '腰果', '花生', '瓜子', '松子', '开心果', '栗子',
  
  // 饮料
  '可乐', '雪碧', '果汁', '茶', '咖啡', '豆奶', '奶茶', '啤酒', '红酒'
];

// 安全转换数值
function safeFloat(val: any): number | null {
  if (val === null || val === undefined || val === '' || val === '0.0') return null;
  const num = parseFloat(val);
  return isNaN(num) || num === 0 ? null : num;
}

// 解析SQL行
function parseValueRow(line: string): any[] {
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
      if (nextChar === "'") {
        current += "'";
        i++;
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
  
  if (current.trim()) {
    values.push(current.trim());
  }
  
  return values;
}

// 检查是否是常见食物
function isCommonFood(name: string): boolean {
  return COMMON_FOODS.some(keyword => name.includes(keyword));
}

async function main() {
  console.log('🚀 导入精选食物数据\n');
  
  // 1. 导入分类
  console.log('📂 导入分类...');
  const categories = [
    { name: '主食类', slug: 'staple', sortOrder: 1 },
    { name: '肉蛋类', slug: 'meat-egg', sortOrder: 2 },
    { name: '大豆及制品', slug: 'soy', sortOrder: 3 },
    { name: '蔬菜菌藻类', slug: 'vegetable', sortOrder: 4 },
    { name: '水果类', slug: 'fruit', sortOrder: 5 },
    { name: '奶类', slug: 'dairy', sortOrder: 6 },
    { name: '油脂类', slug: 'oil', sortOrder: 7 },
    { name: '坚果类', slug: 'nut', sortOrder: 8 },
    { name: '调味品', slug: 'seasoning', sortOrder: 9 },
    { name: '饮料类', slug: 'beverage', sortOrder: 10 },
    { name: '休闲零食', slug: 'snack', sortOrder: 11 },
    { name: '餐饮食品', slug: 'restaurant', sortOrder: 12 }
  ];
  
  const categoryMap = new Map<number, string>();
  for (let i = 0; i < categories.length; i++) {
    const cat = await prisma.foodCategory.upsert({
      where: { slug: categories[i].slug },
      create: categories[i],
      update: categories[i]
    });
    categoryMap.set(i + 1, cat.id);
  }
  console.log(`✅ ${categories.length} 个分类\n`);
  
  // 2. 解析和筛选食物
  console.log('📖 解析 food.sql...');
  // Resolve from either the current package or the repository root. This keeps
  // `npm --prefix apps/api run food:import` and root-level invocations equivalent.
  const candidates = [
    path.resolve(process.cwd(), 'food.sql'),
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'food.sql'),
  ];
  const sqlPath = candidates.find((candidate) => fs.existsSync(candidate));
  if (!sqlPath) {
    throw new Error(`food.sql not found. Checked: ${candidates.join(', ')}`);
  }
  const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
  const lines = sqlContent.split('\n');
  
  const allFoods: any[] = [];
  let capturing = false;
  
  for (const line of lines) {
    if (line.includes('INSERT INTO food') && line.includes('VALUES')) {
      capturing = true;
      const match = line.match(/VALUES\s*(.+)/);
      if (match && match[1].trim().startsWith('(')) {
        allFoods.push(match[1].trim());
      }
      continue;
    }
    
    if (capturing) {
      const trimmed = line.trim();
      if (trimmed.startsWith('(')) {
        allFoods.push(trimmed);
      }
      if (trimmed.endsWith(';')) {
        capturing = false;
      }
    }
  }
  
  console.log(`📊 总共 ${allFoods.length} 条食物`);
  
  // 3. 筛选常见食物
  console.log('🔍 筛选常见食物...');
  const selectedFoods: any[] = [];
  
  for (const row of allFoods) {
    try {
      const values = parseValueRow(row);
      const name = String(values[2]); // 名称在第3列
      
      if (isCommonFood(name)) {
        selectedFoods.push(values);
      }
    } catch (err) {
      // 跳过解析失败的
    }
  }
  
  console.log(`✅ 筛选出 ${selectedFoods.length} 条常见食物\n`);
  
  // 4. 导入食物
  console.log('💾 导入到数据库...');
  let imported = 0;
  let failed = 0;
  
  for (const values of selectedFoods) {
    try {
      const [
        category_id, code, name, thumb_image_url, is_liquid, health_light,
        weight, calory, fat, protein, fiber_dietary, carbohydrate,
        vitamin_a, thiamine, lactoflavin, vitamin_c, vitamin_e, niacin,
        natrium, calcium, iron, kalium, zinc, selenium, magnesium, copper,
        manganese, cholesterol, folacin, saturated_fat, sugar, vitamin_b6,
        phosphor, gi, gl
      ] = values;
      
      const categoryId = categoryMap.get(Number(category_id));

      // Keep the importer safe to re-run after an interrupted batch. The
      // source table has no stable unique key in our schema, so name + pinyin
      // is the closest deterministic identity available here.
      const existing = await prisma.foodItem.findFirst({
        where: { name: String(name), pinyinCode: code || null },
        select: { id: true },
      });
      if (existing) {
        imported++;
        continue;
      }
      
      const food = await prisma.foodItem.create({
        data: {
          name: String(name),
          categoryId: categoryId || null,
          pinyinCode: code || null,
          thumbImageUrl: thumb_image_url || null,
          isLiquid: is_liquid === '1',
          healthLight: Number(health_light) || 0,
          isActive: true
        }
      });
      
      await prisma.foodNutrition.create({
        data: {
          foodId: food.id,
          basisGrams: 100,
          energyKcal: safeFloat(calory) || 0,
          proteinG: safeFloat(protein) || 0,
          fatG: safeFloat(fat) || 0,
          carbohydrateG: safeFloat(carbohydrate) || 0,
          dietaryFiberG: safeFloat(fiber_dietary),
          sodiumMg: safeFloat(natrium),
          vitaminAUg: safeFloat(vitamin_a),
          thiamineMg: safeFloat(thiamine),
          riboflavinMg: safeFloat(lactoflavin),
          vitaminB6Mg: safeFloat(vitamin_b6),
          vitaminCMg: safeFloat(vitamin_c),
          vitaminEMg: safeFloat(vitamin_e),
          niacinMg: safeFloat(niacin),
          folateMcg: safeFloat(folacin),
          calciumMg: safeFloat(calcium),
          ironMg: safeFloat(iron),
          potassiumMg: safeFloat(kalium),
          zincMg: safeFloat(zinc),
          seleniumUg: safeFloat(selenium),
          magnesiumMg: safeFloat(magnesium),
          copperMg: safeFloat(copper),
          manganeseMg: safeFloat(manganese),
          phosphorusMg: safeFloat(phosphor),
          cholesterolMg: safeFloat(cholesterol),
          saturatedFatG: safeFloat(saturated_fat),
          sugarG: safeFloat(sugar),
          gi: safeFloat(gi),
          gl: safeFloat(gl)
        }
      });
      
      const w = safeFloat(weight);
      if (w && w > 0) {
        await prisma.foodServing.create({
          data: {
            foodId: food.id,
            label: '标准份',
            grams: w
          }
        });
      }
      
      imported++;
      if (imported % 50 === 0) {
        process.stdout.write(`\r  已导入: ${imported}`);
      }
    } catch (err) {
      failed++;
    }
  }
  
  console.log(`\n\n✅ 导入完成！`);
  console.log(`   成功: ${imported}`);
  console.log(`   失败: ${failed}`);
  
  // 5. 统计
  const stats = await prisma.foodItem.groupBy({
    by: ['categoryId'],
    _count: true
  });
  
  console.log('\n📊 各分类统计：');
  for (const stat of stats) {
    if (!stat.categoryId) continue;
    const cat = await prisma.foodCategory.findUnique({
      where: { id: stat.categoryId }
    });
    console.log(`   ${cat?.name}: ${stat._count}`);
  }
  
  console.log('\n🎉 完成！\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
