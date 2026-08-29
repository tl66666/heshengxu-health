/**
 * 导入更多常见食物数据 - 优化版
 * 目标：800-1000条最常用的食物
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// 扩展常见食物关键词列表（更全面）
const COMMON_FOODS = [
  // 主食类（100+）
  '米饭', '白米', '糙米', '黑米', '紫米', '香米', '糯米',
  '面条', '拉面', '刀削面', '意面', '乌冬面', '荞麦面', '挂面', '方便面',
  '馒头', '花卷', '包子', '饺子', '馄饨', '烧麦', '春卷', '煎饺',
  '面包', '全麦', '吐司', '法棍', '贝果', '可颂', '甜甜圈',
  '粥', '小米粥', '玉米粥', '八宝粥',
  '红薯', '紫薯', '土豆', '山药', '芋头', '南瓜',
  '玉米', '燕麦', '麦片', '谷物',
  '年糕', '粉丝', '粉条', '米粉', '河粉', '凉皮',
  '披萨', '汉堡', '三明治', '热狗', '薯条',
  
  // 肉类（150+）
  '鸡', '鸡肉', '鸡胸', '鸡腿', '鸡翅', '鸡爪', '鸡心', '鸡肝',
  '猪', '猪肉', '五花肉', '里脊', '排骨', '猪蹄', '猪肝', '猪腰',
  '牛', '牛肉', '牛排', '牛腩', '牛腱', '牛肚',
  '羊', '羊肉', '羊排', '羊腿',
  '鸭', '鸭肉', '鸭腿', '烤鸭',
  '鹅', '鹅肉',
  '鱼', '三文鱼', '鳕鱼', '鲈鱼', '草鱼', '鲤鱼', '鲫鱼', '带鱼', '黄花鱼', '金枪鱼',
  '虾', '大虾', '明虾', '龙虾', '基围虾', '皮皮虾',
  '蟹', '螃蟹', '大闸蟹',
  '贝', '扇贝', '蛤蜊', '生蚝', '牡蛎', '鲍鱼',
  '鱿鱼', '章鱼', '墨鱼', '海参',
  '鸡蛋', '鸭蛋', '鹅蛋', '鹌鹑蛋', '皮蛋', '咸蛋',
  '培根', '火腿', '香肠', '腊肉', '腊肠',
  '牛肉干', '猪肉脯', '鸡柳', '鸡排', '炸鸡',
  
  // 豆制品（50+）
  '豆腐', '嫩豆腐', '老豆腐', '豆腐干', '豆腐皮', '豆腐脑', '臭豆腐',
  '豆浆', '豆奶', '豆腐乳', '腐竹', '千张',
  '黄豆', '黑豆', '红豆', '绿豆', '豌豆', '蚕豆',
  '毛豆', '豆芽', '黄豆芽', '绿豆芽',
  
  // 蔬菜类（200+）
  '白菜', '大白菜', '小白菜', '娃娃菜', '芥蓝', '油菜', '菜心',
  '西兰花', '花菜', '花椰菜',
  '菠菜', '茼蒿', '生菜', '油麦菜', '苦菊', '芝麻菜',
  '芹菜', '香菜', '韭菜', '韭黄', '蒜苗', '葱', '大葱', '小葱', '洋葱',
  '黄瓜', '番茄', '西红柿', '樱桃番茄', '圣女果',
  '茄子', '青椒', '红椒', '辣椒', '尖椒', '彩椒', '甜椒',
  '胡萝卜', '白萝卜', '青萝卜',
  '大蒜', '生姜', '姜',
  '土豆', '红薯', '山药', '芋头', '莲藕', '藕',
  '冬瓜', '南瓜', '丝瓜', '苦瓜', '黄瓜', '西葫芦',
  '玉米', '豌豆', '毛豆', '四季豆', '豆角', '扁豆',
  '芦笋', '竹笋', '春笋', '莴笋',
  '蘑菇', '香菇', '金针菇', '平菇', '杏鲍菇', '草菇', '木耳', '银耳', '海带', '紫菜',
  
  // 水果类（150+）
  '苹果', '红苹果', '青苹果',
  '香蕉', '芭蕉',
  '橙', '橙子', '橘子', '柑橘', '柚子', '西柚', '葡萄柚',
  '葡萄', '青葡萄', '红葡萄', '提子', '巨峰', '无籽',
  '西瓜', '哈密瓜', '甜瓜', '香瓜',
  '草莓', '蓝莓', '黑莓', '蔓越莓', '桑葚',
  '猕猴桃', '奇异果',
  '芒果', '榴莲', '火龙果', '百香果',
  '梨', '雪梨', '鸭梨',
  '桃', '桃子', '水蜜桃', '油桃', '黄桃',
  '李', '李子', '杏', '杏子', '樱桃', '车厘子',
  '荔枝', '龙眼', '桂圆',
  '柿子', '石榴', '山竹',
  '菠萝', '凤梨', '木瓜', '椰子',
  '柠檬', '青柠',
  '枣', '红枣', '冬枣',
  '无花果', '牛油果',
  
  // 奶制品（40+）
  '牛奶', '纯牛奶', '鲜牛奶', '全脂奶', '脱脂奶', '低脂奶',
  '酸奶', '希腊酸奶', '原味酸奶',
  '奶酪', '芝士', '奶油', '黄油', '炼乳',
  '奶粉', '豆奶', '椰奶', '杏仁奶',
  
  // 坚果（40+）
  '核桃', '杏仁', '腰果', '开心果', '夏威夷果',
  '花生', '瓜子', '葵花籽', '南瓜子', '西瓜子',
  '松子', '板栗', '栗子', '榛子', '碧根果',
  
  // 饮料（80+）
  '可乐', '雪碧', '芬达', '七喜',
  '果汁', '橙汁', '苹果汁', '葡萄汁', '西瓜汁',
  '茶', '绿茶', '红茶', '乌龙茶', '普洱', '花茶', '奶茶',
  '咖啡', '拿铁', '卡布奇诺', '美式',
  '豆浆', '豆奶',
  '啤酒', '红酒', '白酒', '葡萄酒',
  '汽水', '苏打水', '气泡水',
  
  // 零食（50+）
  '饼干', '曲奇', '威化', '苏打饼',
  '薯片', '爆米花', '薯条',
  '巧克力', '糖果', '口香糖',
  '蛋糕', '面包', '冰淇淋', '雪糕',
  '果冻', '布丁',
];

// 解析SQL行
function parseValueRow(line) {
  line = line.trim().replace(/^\(/, '').replace(/\)[,;]?$/, '');
  const values = [];
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
function isCommonFood(name) {
  return COMMON_FOODS.some(keyword => name.includes(keyword));
}

// 安全转换数值
function safeFloat(val) {
  if (val === null || val === undefined || val === '' || val === '0.0') return null;
  const num = parseFloat(val);
  return isNaN(num) || num === 0 ? null : num;
}

async function main() {
  console.log('🚀 导入更多常见食物数据\n');
  
  try {
    // 1. 检查现有数据
    const existingCount = await prisma.foodItem.count();
    console.log(`📊 数据库中现有 ${existingCount} 条食物\n`);
    
    // 2. 解析SQL文件
    console.log('📖 解析 food.sql...');
    const sqlPath = path.join(__dirname, '../../food.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
    const lines = sqlContent.split('\n');
    
    const allFoods = [];
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
    
    console.log(`   找到 ${allFoods.length} 条食物数据\n`);
    
    // 3. 筛选常见食物
    console.log('🔍 筛选常见食物...');
    const selectedFoods = [];
    
    for (const row of allFoods) {
      try {
        const values = parseValueRow(row);
        const name = String(values[2]);
        
        if (isCommonFood(name)) {
          selectedFoods.push(values);
        }
      } catch (err) {
        // 跳过解析失败的
      }
    }
    
    console.log(`   筛选出 ${selectedFoods.length} 条常见食物\n`);
    
    // 4. 获取分类映射
    const categories = await prisma.foodCategory.findMany();
    const categoryMap = new Map();
    categories.forEach(cat => {
      const oldId = ['staple', 'meat-egg', 'soy', 'vegetable', 'fruit', 'dairy', 'oil', 'nut', 'seasoning', 'beverage', 'snack', 'restaurant'].indexOf(cat.slug) + 1;
      if (oldId > 0) {
        categoryMap.set(oldId, cat.id);
      }
    });
    
    // 5. 导入食物（批量）
    console.log('💾 批量导入食物...');
    let imported = 0;
    let skipped = 0;
    let failed = 0;
    
    const batchSize = 50; // 每批50条
    for (let i = 0; i < selectedFoods.length; i += batchSize) {
      const batch = selectedFoods.slice(i, i + batchSize);
      
      for (const values of batch) {
        try {
          const [
            category_id, code, name, thumb_image_url, is_liquid, health_light,
            weight, calory, fat, protein, fiber_dietary, carbohydrate,
            vitamin_a, thiamine, lactoflavin, vitamin_c, vitamin_e, niacin,
            natrium, calcium, iron, kalium, zinc, selenium, magnesium, copper,
            manganese, cholesterol, folacin, saturated_fat, sugar, vitamin_b6,
            phosphor, gi, gl
          ] = values;
          
          // 检查是否已存在
          const existing = await prisma.foodItem.findFirst({
            where: { name: String(name) }
          });
          
          if (existing) {
            skipped++;
            continue;
          }
          
          const categoryId = categoryMap.get(Number(category_id));
          
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
          if (imported % 10 === 0) {
            process.stdout.write(`\r   已导入: ${imported}, 跳过: ${skipped}`);
          }
        } catch (err) {
          failed++;
          if (failed <= 3) {
            console.error(`\n   ✗ 导入失败: ${err.message}`);
          }
        }
      }
    }
    
    console.log(`\n\n✅ 导入完成！`);
    console.log(`   成功: ${imported}`);
    console.log(`   跳过: ${skipped}`);
    console.log(`   失败: ${failed}`);
    
    // 6. 统计
    const total = await prisma.foodItem.count();
    console.log(`\n📊 数据库中现有 ${total} 条食物\n`);
    
    const stats = await prisma.foodItem.groupBy({
      by: ['categoryId'],
      _count: true
    });
    
    console.log('📊 各分类统计：');
    for (const stat of stats) {
      if (!stat.categoryId) continue;
      const cat = await prisma.foodCategory.findUnique({
        where: { id: stat.categoryId }
      });
      console.log(`   ${cat?.name}: ${stat._count}`);
    }
    
    console.log('\n🎉 完成！\n');
    
  } catch (error) {
    console.error('❌ 错误：', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
