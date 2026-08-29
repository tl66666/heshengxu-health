/**
 * 将 food.sql 转换为 JSON 格式
 * 用于微信云开发数据导入
 */

import fs from 'fs';
import path from 'path';

// 解析单行 VALUES
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

// 安全转换数值
function safeFloat(val: any): number | null {
  if (val === null || val === undefined || val === '' || val === '0.0') return null;
  const num = parseFloat(val);
  return isNaN(num) || num === 0 ? null : num;
}

// 转换为云数据库格式
function convertToCloudFormat(record: any): any {
  const [
    category_id, code, name, thumb_image_url, is_liquid, health_light,
    weight, calory, fat, protein, fiber_dietary, carbohydrate,
    vitamin_a, thiamine, lactoflavin, vitamin_c, vitamin_e, niacin,
    natrium, calcium, iron, kalium, zinc, selenium, magnesium, copper,
    manganese, cholesterol, folacin, saturated_fat, sugar, vitamin_b6,
    phosphor, gi, gl
  ] = record;
  
  return {
    categoryId: Number(category_id),
    name: String(name),
    pinyinCode: code || null,
    thumbImageUrl: thumb_image_url || null,
    isLiquid: is_liquid === '1',
    healthLight: Number(health_light) || 0,
    
    nutrition: {
      basisGrams: 100,
      calories: safeFloat(calory) || 0,
      protein: safeFloat(protein) || 0,
      fat: safeFloat(fat) || 0,
      carbohydrate: safeFloat(carbohydrate) || 0,
      fiber: safeFloat(fiber_dietary),
      sodium: safeFloat(natrium),
      
      // 维生素
      vitaminA: safeFloat(vitamin_a),
      thiamine: safeFloat(thiamine),
      riboflavin: safeFloat(lactoflavin),
      vitaminB6: safeFloat(vitamin_b6),
      vitaminC: safeFloat(vitamin_c),
      vitaminE: safeFloat(vitamin_e),
      niacin: safeFloat(niacin),
      folate: safeFloat(folacin),
      
      // 矿物质
      calcium: safeFloat(calcium),
      iron: safeFloat(iron),
      potassium: safeFloat(kalium),
      zinc: safeFloat(zinc),
      selenium: safeFloat(selenium),
      magnesium: safeFloat(magnesium),
      copper: safeFloat(copper),
      manganese: safeFloat(manganese),
      phosphorus: safeFloat(phosphor),
      
      // 其他
      cholesterol: safeFloat(cholesterol),
      saturatedFat: safeFloat(saturated_fat),
      sugar: safeFloat(sugar),
      gi: safeFloat(gi),
      gl: safeFloat(gl)
    },
    
    servings: (() => {
      const w = safeFloat(weight);
      if (!w || w <= 0) return [];
      return [
        { label: '标准份', grams: w }
      ];
    })()
  };
}

async function main() {
  console.log('🔄 开始转换 food.sql 为 JSON 格式...\n');
  
  const sqlPath = path.join(__dirname, '../food.sql');
  const outputDir = path.join(__dirname, '../cloud-data');
  
  // 创建输出目录
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // 读取 SQL 文件
  const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
  const lines = sqlContent.split('\n');
  
  const valueRows: string[] = [];
  let capturing = false;
  
  console.log('📖 解析 SQL 文件...');
  
  for (const line of lines) {
    if (line.includes('INSERT INTO food') && line.includes('VALUES')) {
      capturing = true;
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
      if (trimmed.endsWith(';')) {
        capturing = false;
      }
    }
  }
  
  console.log(`✅ 找到 ${valueRows.length} 条记录\n`);
  
  // 转换数据
  console.log('🔄 转换数据格式...');
  const foods: any[] = [];
  let failed = 0;
  
  for (let i = 0; i < valueRows.length; i++) {
    try {
      const values = parseValueRow(valueRows[i]);
      const food = convertToCloudFormat(values);
      foods.push(food);
    } catch (err) {
      failed++;
      if (failed <= 5) {
        console.warn(`  ⚠️  行 ${i + 1} 转换失败:`, err);
      }
    }
  }
  
  console.log(`✅ 转换完成: 成功 ${foods.length}, 失败 ${failed}\n`);
  
  // 分批保存（每个文件1000条）
  console.log('💾 保存 JSON 文件...');
  const batchSize = 1000;
  const batches = Math.ceil(foods.length / batchSize);
  
  for (let i = 0; i < batches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, foods.length);
    const batch = foods.slice(start, end);
    
    const filename = `foods-batch-${String(i + 1).padStart(2, '0')}.json`;
    const filepath = path.join(outputDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(batch, null, 2), 'utf-8');
    console.log(`  ✓ ${filename} (${batch.length} 条)`);
  }
  
  // 保存分类数据
  const categories = [
    { categoryId: 1, name: '主食类', slug: 'staple', sortOrder: 1 },
    { categoryId: 2, name: '肉蛋类', slug: 'meat-egg', sortOrder: 2 },
    { categoryId: 3, name: '大豆及制品', slug: 'soy', sortOrder: 3 },
    { categoryId: 4, name: '蔬菜菌藻类', slug: 'vegetable', sortOrder: 4 },
    { categoryId: 5, name: '水果类', slug: 'fruit', sortOrder: 5 },
    { categoryId: 6, name: '奶类', slug: 'dairy', sortOrder: 6 },
    { categoryId: 7, name: '油脂类', slug: 'oil', sortOrder: 7 },
    { categoryId: 8, name: '坚果类', slug: 'nut', sortOrder: 8 },
    { categoryId: 9, name: '调味品', slug: 'seasoning', sortOrder: 9 },
    { categoryId: 10, name: '饮料类', slug: 'beverage', sortOrder: 10 },
    { categoryId: 11, name: '休闲零食', slug: 'snack', sortOrder: 11 },
    { categoryId: 12, name: '餐饮食品', slug: 'restaurant', sortOrder: 12 }
  ];
  
  fs.writeFileSync(
    path.join(outputDir, 'categories.json'),
    JSON.stringify(categories, null, 2),
    'utf-8'
  );
  console.log(`  ✓ categories.json (${categories.length} 条)`);
  
  console.log('\n🎉 转换完成！');
  console.log(`\n📁 输出目录: ${outputDir}`);
  console.log(`📊 总计: ${batches} 个批次文件 + 1 个分类文件\n`);
}

main().catch(console.error);
