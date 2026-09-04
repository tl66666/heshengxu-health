/**
 * 营养计算工具函数
 */

import type { FoodNutrition } from '../features/food/food.types.js';

/**
 * 计算百分比
 */
export function calculatePercentage(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.round((current / target) * 100);
}

/**
 * 获取进度条颜色
 */
export function getProgressColor(percentage: number): string {
  if (percentage < 50) return '#7fcc8f';
  if (percentage < 90) return '#f5d99a';
  return '#e89b8f';
}

/**
 * 生成营养亮点
 */
export function generateNutritionHighlights(nutrition: FoodNutrition): string[] {
  const highlights: string[] = [];
  
  // 高蛋白
  if (nutrition.proteinG && nutrition.proteinG > 15) {
    highlights.push('高蛋白');
  }
  
  // 低脂肪
  if (nutrition.fatG !== null && nutrition.fatG < 5) {
    highlights.push('低脂肪');
  }
  
  // 富含膳食纤维
  if (nutrition.dietaryFiberG && nutrition.dietaryFiberG > 3) {
    highlights.push('高纤维');
  }
  
  // 低热量
  if (nutrition.energyKcal < 100) {
    highlights.push('低热量');
  }
  
  return highlights;
}

/**
 * 获取健康等级标签
 */
export function getHealthLightLabel(level: number): string {
  const labels: Record<number, string> = {
    0: '尽量少吃',
    1: '可以放心吃',
    2: '适量食用',
  };
  return labels[level] || '未知';
}

/**
 * 获取健康等级图标
 */
export function getHealthLightIcon(level: number): string {
  const icons: Record<number, string> = {
    0: '🔴',
    1: '🟢',
    2: '🟡',
  };
  return icons[level] || '⚪';
}

/**
 * 格式化营养素数值
 */
export function formatNutrient(value: number | null | undefined, unit: string = 'g'): string {
  if (value === null || value === undefined) return '--';
  if (value === 0) return '--';
  
  // 小数点后一位
  const formatted = Math.round(value * 10) / 10;
  return `${formatted}${unit}`;
}

/**
 * 格式化热量
 */
export function formatCalories(kcal: number): string {
  if (kcal === 0) return '--';
  return `${Math.round(kcal)} 千卡`;
}

/**
 * 计算食物营养（按克数）
 */
export function calculateNutritionByGrams(
  nutrition: FoodNutrition,
  grams: number
): FoodNutrition {
  const ratio = grams / nutrition.basisGrams;
  
  return {
    ...nutrition,
    basisGrams: grams,
    energyKcal: Math.round(nutrition.energyKcal * ratio),
    proteinG: Math.round(nutrition.proteinG * ratio * 10) / 10,
    fatG: Math.round(nutrition.fatG * ratio * 10) / 10,
    carbohydrateG: Math.round(nutrition.carbohydrateG * ratio * 10) / 10,
    dietaryFiberG: nutrition.dietaryFiberG ? Math.round(nutrition.dietaryFiberG * ratio * 10) / 10 : null,
    // ... 其他营养素也按比例计算
  };
}

/**
 * 获取食物 Emoji
 */
export function getFoodEmoji(foodName: string, categorySlug?: string): string {
  // 根据食物名称或分类返回合适的 emoji
  const nameEmojiMap: Record<string, string> = {
    // 主食
    '米饭': '🍚',
    '面条': '🍜',
    '馒头': '🥟',
    '面包': '🍞',
    '燕麦': '🌾',
    
    // 肉类
    '鸡': '🍗',
    '牛': '🥩',
    '猪': '🥓',
    '鱼': '🐟',
    '虾': '🦐',
    '蛋': '🥚',
    
    // 蔬菜
    '西兰花': '🥦',
    '番茄': '🍅',
    '黄瓜': '🥒',
    '胡萝卜': '🥕',
    '白菜': '🥬',
    '土豆': '🥔',
    
    // 水果
    '苹果': '🍎',
    '香蕉': '🍌',
    '橙': '🍊',
    '葡萄': '🍇',
    '西瓜': '🍉',
    '草莓': '🍓',
    
    // 奶制品
    '牛奶': '🥛',
    '酸奶': '🥛',
    '奶酪': '🧀',
    
    // 豆制品
    '豆腐': '🥡',
    '豆浆': '🥛',
  };
  
  // 优先匹配名称中的关键词
  for (const [keyword, emoji] of Object.entries(nameEmojiMap)) {
    if (foodName.includes(keyword)) {
      return emoji;
    }
  }
  
  // 根据分类返回默认 emoji
  const categoryEmojiMap: Record<string, string> = {
    'staple': '🍚',
    'meat-egg': '🍗',
    'soy': '🥡',
    'vegetable': '🥬',
    'fruit': '🍎',
    'dairy': '🥛',
    'nut': '🌰',
    'oil': '🫒',
    'seasoning': '🧂',
    'beverage': '🥤',
    'snack': '🍪',
  };
  
  if (categorySlug && categoryEmojiMap[categorySlug]) {
    return categoryEmojiMap[categorySlug];
  }
  
  // 默认
  return '🍽️';
}

/**
 * 获取每日推荐摄入量
 */
export function getDailyRecommendation(nutrient: string): number {
  const recommendations: Record<string, number> = {
    energy: 2000,        // 千卡
    protein: 60,         // 克
    fat: 60,             // 克
    carbohydrate: 300,   // 克
    dietaryFiber: 25,    // 克
    sodium: 2000,        // 毫克
    calcium: 800,        // 毫克
    iron: 15,            // 毫克
    vitaminC: 100,       // 毫克
  };
  
  return recommendations[nutrient] || 0;
}

/**
 * 计算占每日推荐量的百分比
 */
export function calculateDailyPercentage(
  value: number,
  nutrient: string
): number {
  const daily = getDailyRecommendation(nutrient);
  if (daily === 0) return 0;
  return Math.round((value / daily) * 100);
}
