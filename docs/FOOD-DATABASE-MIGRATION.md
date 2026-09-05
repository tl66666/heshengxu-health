# 食物库数据迁移方案

> 将现有 food.sql 和 food_category.sql 数据导入到 Prisma 数据库

**创建时间**：2026-08-29  
**状态**：实施中

---

## 📋 目标

将约 49,689 条食物数据和 12 个分类从 MySQL SQL 文件迁移到 PostgreSQL 数据库。

---

## 🔄 迁移策略

### 方案选择：扩展现有 Schema

**现状分析**：
- ✅ 已有 `FoodItem` 和 `FoodCategory` 模型
- ✅ 已有 `FoodNutrition` 模型（基础营养）
- ❌ 缺少详细营养字段（维生素、矿物质等）
- ❌ 缺少健康灯、升糖指数等字段

**策略**：
1. 保持现有模型结构不变
2. 扩展 `FoodNutrition` 模型添加详细营养
3. 在 `FoodItem` 添加元数据字段
4. 创建数据导入脚本

---

## 📐 Schema 扩展

### 1. FoodItem 扩展

```prisma
model FoodItem {
  id            String          @id @default(cuid())
  name          String
  brand         String?
  categoryId    String?
  isActive      Boolean         @default(true)
  
  // 新增字段
  pinyinCode    String?         // 拼音编码，用于搜索
  thumbImageUrl String?         // 缩略图
  isLiquid      Boolean         @default(false) // 是否流食
  healthLight   Int?            @default(0) // 健康灯：0未知 1绿 2黄 3红
  
  category      FoodCategory?   @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  aliases       FoodAlias[]
  nutrition     FoodNutrition?
  servings      FoodServing[]
  mealEntries   MealEntry[]
  recognitionCandidates FoodRecognitionCandidate[]
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  @@index([isActive, name])
  @@index([categoryId, isActive])
  @@index([pinyinCode]) // 新增索引
}
```

### 2. FoodNutrition 扩展

```prisma
model FoodNutrition {
  id              String   @id @default(cuid())
  foodId          String   @unique
  basisGrams      Int      @default(100)
  
  // 基础营养（已有）
  energyKcal      Float
  proteinG        Float
  fatG            Float
  carbohydrateG   Float
  dietaryFiberG   Float?
  sodiumMg        Float?
  
  // 新增：维生素
  vitaminAUg      Float?   // 维生素A (μg)
  thiamineMg      Float?   // 维生素B1 (mg)
  riboflavinMg    Float?   // 维生素B2 (mg)
  vitaminB6Mg     Float?   // 维生素B6 (mg)
  vitaminCMg      Float?   // 维生素C (mg)
  vitaminEMg      Float?   // 维生素E (mg)
  niacinMg        Float?   // 烟酸 (mg)
  folateMcg       Float?   // 叶酸 (μg)
  
  // 新增：矿物质
  calciumMg       Float?   // 钙 (mg)
  ironMg          Float?   // 铁 (mg)
  potassiumMg     Float?   // 钾 (mg)
  zincMg          Float?   // 锌 (mg)
  seleniumUg      Float?   // 硒 (μg)
  magnesiumMg     Float?   // 镁 (mg)
  copperMg        Float?   // 铜 (mg)
  manganeseMg     Float?   // 锰 (mg)
  phosphorusMg    Float?   // 磷 (mg)
  
  // 新增：其他
  cholesterolMg   Float?   // 胆固醇 (mg)
  saturatedFatG   Float?   // 饱和脂肪 (g)
  sugarG          Float?   // 糖 (g)
  gi              Float?   // 升糖指数
  gl              Float?   // 升糖负荷
  
  food            FoodItem @relation(fields: [foodId], references: [id], onDelete: Cascade)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### 3. FoodCategory 映射

现有 SQL 的分类 ID 需要映射到新的 cuid：

```typescript
// 分类映射表
const categoryMapping = {
  1: '主食类',
  2: '肉蛋类',
  3: '大豆及制品',
  4: '蔬菜菌藻类',
  5: '水果类',
  6: '奶类',
  7: '油脂类',
  8: '坚果类',
  9: '调味品',
  10: '饮料类',
  11: '休闲零食',
  12: '餐饮食品'
};
```

---

## 🔧 迁移脚本设计

### 脚本 1：生成 Prisma 迁移

```bash
# scripts/migrate-food-schema.sh
cd apps/api
npx prisma migrate dev --name add_detailed_food_nutrition
```

### 脚本 2：解析 SQL 并导入

```typescript
// scripts/import-food-data.ts
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
  // ... 其他字段
}

// 1. 导入分类
async function importCategories() {
  console.log('📂 导入食物分类...');
  
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
    { name: '餐饮食品', slug: 'restaurant', sortOrder: 12 },
  ];
  
  const categoryMap = new Map<number, string>();
  
  for (let i = 0; i < categories.length; i++) {
    const cat = await prisma.foodCategory.upsert({
      where: { slug: categories[i].slug },
      create: categories[i],
      update: categories[i],
    });
    categoryMap.set(i + 1, cat.id);
  }
  
  console.log(`✅ 已导入 ${categories.length} 个分类`);
  return categoryMap;
}

// 2. 解析 SQL INSERT 语句
function parseSqlInserts(sqlContent: string): SqlFoodRecord[] {
  const records: SqlFoodRecord[] = [];
  
  // 正则匹配 INSERT INTO food ... VALUES (...)
  const insertPattern = /INSERT INTO food[^(]+\(([^)]+)\)\s+VALUES\s*(.+);/gs;
  const match = insertPattern.exec(sqlContent);
  
  if (!match) return records;
  
  const columns = match[1].split(',').map(c => c.trim());
  const valuesBlock = match[2];
  
  // 匹配每个值元组
  const tuplePattern = /\(([^)]+)\)/g;
  let tupleMatch;
  
  while ((tupleMatch = tuplePattern.exec(valuesBlock)) !== null) {
    const values = parseSqlValues(tupleMatch[1]);
    const record: any = {};
    
    columns.forEach((col, idx) => {
      record[col] = values[idx];
    });
    
    records.push(record);
  }
  
  return records;
}

// 3. 解析 SQL 值（处理引号、NULL等）
function parseSqlValues(valuesStr: string): any[] {
  const values: any[] = [];
  let current = '';
  let inQuote = false;
  
  for (let i = 0; i < valuesStr.length; i++) {
    const char = valuesStr[i];
    
    if (char === "'" && valuesStr[i - 1] !== '\\') {
      inQuote = !inQuote;
    } else if (char === ',' && !inQuote) {
      values.push(parseValue(current.trim()));
      current = '';
    } else {
      current += char;
    }
  }
  
  if (current) {
    values.push(parseValue(current.trim()));
  }
  
  return values;
}

function parseValue(val: string): any {
  if (val === 'NULL') return null;
  if (val.startsWith("'") && val.endsWith("'")) {
    return val.slice(1, -1).replace(/\\'/g, "'");
  }
  if (!isNaN(Number(val))) return Number(val);
  return val;
}

// 4. 安全转换数值
function safeFloat(val: string | null): number | null {
  if (!val || val === '' || val === '0.0') return null;
  const num = parseFloat(val);
  return isNaN(num) ? null : num;
}

// 5. 导入食物数据
async function importFoods(
  categoryMap: Map<number, string>,
  batchSize = 500
) {
  console.log('🍽️  导入食物数据...');
  
  const sqlPath = path.join(__dirname, '../food.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
  
  const records = parseSqlInserts(sqlContent);
  console.log(`📊 解析到 ${records.length} 条食物记录`);
  
  let imported = 0;
  
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    
    await prisma.$transaction(async (tx) => {
      for (const record of batch) {
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
        
        // 创建常见份量
        if (record.weight) {
          const weight = parseFloat(record.weight);
          if (!isNaN(weight) && weight > 0) {
            await tx.foodServing.create({
              data: {
                foodId: foodItem.id,
                label: '标准份',
                grams: weight,
              },
            });
          }
        }
      }
    });
    
    imported += batch.length;
    console.log(`✅ 进度：${imported} / ${records.length} (${Math.round(imported / records.length * 100)}%)`);
  }
  
  console.log(`🎉 导入完成！共 ${imported} 条食物`);
}

// 主函数
async function main() {
  console.log('🚀 开始导入食物数据库...\n');
  
  try {
    const categoryMap = await importCategories();
    await importFoods(categoryMap);
    
    // 统计
    const stats = await prisma.foodItem.groupBy({
      by: ['categoryId'],
      _count: true,
    });
    
    console.log('\n📊 导入统计：');
    for (const stat of stats) {
      const category = await prisma.foodCategory.findUnique({
        where: { id: stat.categoryId || '' },
      });
      console.log(`  ${category?.name}: ${stat._count} 条`);
    }
    
  } catch (error) {
    console.error('❌ 导入失败：', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

---

## 🚀 执行步骤

### 步骤 1：备份现有数据

```bash
# 导出现有数据（如果有）
cd apps/api
npx prisma db pull
```

### 步骤 2：更新 Schema

```bash
# 编辑 schema.prisma，添加新字段
# 然后生成迁移
npx prisma migrate dev --name add_detailed_nutrition
```

### 步骤 3：运行导入脚本

```bash
# 安装依赖
pnpm install

# 运行导入
pnpm tsx scripts/import-food-data.ts
```

### 步骤 4：验证数据

```bash
# 检查数据量
npx prisma studio
```

---

## ⚠️ 注意事项

### 1. 数据清洗

- 空字符串转为 NULL
- "0.0" 转为 NULL
- 处理转义字符

### 2. 性能优化

- 批量插入（500条/批）
- 使用事务
- 关闭日志（生产环境）

### 3. 错误处理

- 记录导入失败的食物
- 跳过重复数据
- 生成导入报告

---

## 📊 预期结果

```
✅ 食物分类：12 个
✅ 食物数据：约 49,689 条
✅ 营养数据：约 49,689 条
✅ 常见份量：~30,000 条（部分有重量数据）
```

---

## 🔄 回滚方案

```bash
# 如果导入失败，回滚到之前的迁移
npx prisma migrate reset

# 或删除最后一次迁移
rm -rf prisma/migrations/xxx_add_detailed_nutrition
npx prisma db push
```

---

**创建者**：AI Development Team  
**创建时间**：2026-08-29
