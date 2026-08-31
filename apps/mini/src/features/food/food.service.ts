import { createMiniApiClient } from '../../services/mini-api.js';
import { calculateFoodNutrition, type FoodItem, type MealType } from './food.types.js';
import type { MealEntry } from './food.summary.js';

export interface SearchFoodsOptions {
  query?: string;
  categoryId?: string;
  healthLight?: number;
  page?: number;
  pageSize?: number;
}

export interface SearchFoodsResult {
  items: FoodItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FoodCategory {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  count?: number;
}

const LOCAL_FOOD_CATALOG: FoodItem[] = [
  {
    id: 'local-oatmeal',
    name: '燕麦',
    brand: null,
    category: { id: 'grain', name: '谷物', slug: 'grain' },
    nutrition: {
      basisGrams: 100,
      energyKcal: 367,
      proteinG: 15,
      fatG: 6.7,
      carbohydrateG: 61.6,
      dietaryFiberG: 10.1,
      sodiumMg: 3,
    },
    servings: [{ id: 'local-oatmeal-1', label: '一碗', grams: 40 }],
  },
  {
    id: 'local-egg',
    name: '鸡蛋',
    brand: null,
    category: { id: 'egg', name: '蛋类', slug: 'egg' },
    nutrition: {
      basisGrams: 100,
      energyKcal: 144,
      proteinG: 13.3,
      fatG: 8.8,
      carbohydrateG: 2.8,
      dietaryFiberG: 0,
      sodiumMg: 131,
    },
    servings: [{ id: 'local-egg-1', label: '一个', grams: 50 }],
  },
  {
    id: 'local-chicken',
    name: '鸡胸肉',
    brand: null,
    category: { id: 'meat', name: '肉类', slug: 'meat' },
    nutrition: {
      basisGrams: 100,
      energyKcal: 133,
      proteinG: 24.6,
      fatG: 3.5,
      carbohydrateG: 0,
      dietaryFiberG: 0,
      sodiumMg: 37,
    },
    servings: [{ id: 'local-chicken-1', label: '一块', grams: 120 }],
  },
  {
    id: 'local-broccoli',
    name: '西兰花',
    brand: null,
    category: { id: 'vegetable', name: '蔬菜', slug: 'vegetable' },
    nutrition: {
      basisGrams: 100,
      energyKcal: 34,
      proteinG: 2.8,
      fatG: 0.4,
      carbohydrateG: 6.6,
      dietaryFiberG: 2.6,
      sodiumMg: 33,
    },
    servings: [{ id: 'local-broccoli-1', label: '一小碗', grams: 100 }],
  },
  {
    id: 'local-apple',
    name: '苹果',
    brand: null,
    category: { id: 'fruit', name: '水果', slug: 'fruit' },
    nutrition: {
      basisGrams: 100,
      energyKcal: 53,
      proteinG: 0.4,
      fatG: 0.2,
      carbohydrateG: 13.7,
      dietaryFiberG: 1.7,
      sodiumMg: 1,
    },
    servings: [{ id: 'local-apple-1', label: '一个', grams: 180 }],
  },
  {
    id: 'local-milk',
    name: '牛奶',
    brand: null,
    category: { id: 'dairy', name: '奶类', slug: 'dairy' },
    nutrition: {
      basisGrams: 100,
      energyKcal: 54,
      proteinG: 3,
      fatG: 3.2,
      carbohydrateG: 3.4,
      dietaryFiberG: 0,
      sodiumMg: 37,
    },
    servings: [{ id: 'local-milk-1', label: '一杯', grams: 250 }],
  },
  {
    id: 'local-rice',
    name: '米饭',
    brand: null,
    category: { id: 'staple', name: '主食', slug: 'staple' },
    nutrition: {
      basisGrams: 100,
      energyKcal: 116,
      proteinG: 2.6,
      fatG: 0.3,
      carbohydrateG: 25.9,
      dietaryFiberG: 0.3,
      sodiumMg: 2,
    },
    servings: [{ id: 'local-rice-1', label: '一碗', grams: 150 }],
  },
  {
    id: 'local-tofu',
    name: '豆腐',
    brand: null,
    category: { id: 'soy', name: '豆制品', slug: 'soy' },
    nutrition: {
      basisGrams: 100,
      energyKcal: 81,
      proteinG: 8.1,
      fatG: 3.7,
      carbohydrateG: 4.2,
      dietaryFiberG: 0.4,
      sodiumMg: 7,
    },
    servings: [{ id: 'local-tofu-1', label: '半盒', grams: 150 }],
  },
];

function makeLocalFood(
  id: string,
  name: string,
  category: { id: string; name: string; slug: string },
  nutrition: Pick<FoodItem['nutrition'], 'energyKcal' | 'proteinG' | 'fatG' | 'carbohydrateG'>,
  serving: [string, number],
): FoodItem {
  return {
    id: `local-${id}`,
    name,
    brand: null,
    category,
    nutrition: { basisGrams: 100, dietaryFiberG: null, sodiumMg: null, ...nutrition },
    servings: [{ id: `local-${id}-1`, label: serving[0], grams: serving[1] }],
  };
}

const LOCAL_CATEGORIES = {
  staple: { id: 'staple', name: '主食', slug: 'staple' },
  protein: { id: 'protein', name: '肉蛋豆奶', slug: 'protein' },
  vegetable: { id: 'vegetable', name: '蔬菜', slug: 'vegetable' },
  fruit: { id: 'fruit', name: '水果', slug: 'fruit' },
  dairy: { id: 'dairy', name: '奶类', slug: 'dairy' },
  nut: { id: 'nut', name: '坚果', slug: 'nut' },
};

LOCAL_FOOD_CATALOG.push(
  makeLocalFood(
    'banana',
    '香蕉',
    LOCAL_CATEGORIES.fruit,
    { energyKcal: 93, proteinG: 1.4, fatG: 0.2, carbohydrateG: 22 },
    ['一根', 100],
  ),
  makeLocalFood(
    'tomato',
    '番茄',
    LOCAL_CATEGORIES.vegetable,
    { energyKcal: 20, proteinG: 0.9, fatG: 0.2, carbohydrateG: 3.9 },
    ['一个', 150],
  ),
  makeLocalFood(
    'cucumber',
    '黄瓜',
    LOCAL_CATEGORIES.vegetable,
    { energyKcal: 16, proteinG: 0.8, fatG: 0.2, carbohydrateG: 2.9 },
    ['一根', 150],
  ),
  makeLocalFood(
    'spinach',
    '菠菜',
    LOCAL_CATEGORIES.vegetable,
    { energyKcal: 28, proteinG: 2.6, fatG: 0.3, carbohydrateG: 4.5 },
    ['一小碗', 100],
  ),
  makeLocalFood(
    'lettuce',
    '生菜',
    LOCAL_CATEGORIES.vegetable,
    { energyKcal: 15, proteinG: 1.4, fatG: 0.2, carbohydrateG: 2.1 },
    ['一盘', 150],
  ),
  makeLocalFood(
    'carrot',
    '胡萝卜',
    LOCAL_CATEGORIES.vegetable,
    { energyKcal: 41, proteinG: 0.9, fatG: 0.2, carbohydrateG: 9.6 },
    ['一根', 100],
  ),
  makeLocalFood(
    'sweet-potato',
    '红薯',
    LOCAL_CATEGORIES.staple,
    { energyKcal: 86, proteinG: 1.6, fatG: 0.1, carbohydrateG: 20.1 },
    ['一根', 150],
  ),
  makeLocalFood(
    'corn',
    '玉米',
    LOCAL_CATEGORIES.staple,
    { energyKcal: 112, proteinG: 4, fatG: 1.2, carbohydrateG: 22.8 },
    ['一根', 200],
  ),
  makeLocalFood(
    'whole-wheat-bread',
    '全麦面包',
    LOCAL_CATEGORIES.staple,
    { energyKcal: 246, proteinG: 8.5, fatG: 3.5, carbohydrateG: 46 },
    ['两片', 60],
  ),
  makeLocalFood(
    'noodles',
    '面条',
    LOCAL_CATEGORIES.staple,
    { energyKcal: 137, proteinG: 4.5, fatG: 1.5, carbohydrateG: 27.5 },
    ['一碗', 180],
  ),
  makeLocalFood(
    'steamed-bun',
    '馒头',
    LOCAL_CATEGORIES.staple,
    { energyKcal: 223, proteinG: 7, fatG: 1.1, carbohydrateG: 47 },
    ['一个', 100],
  ),
  makeLocalFood(
    'salmon',
    '三文鱼',
    LOCAL_CATEGORIES.protein,
    { energyKcal: 139, proteinG: 20.5, fatG: 6.5, carbohydrateG: 0 },
    ['一块', 120],
  ),
  makeLocalFood(
    'beef',
    '牛肉',
    LOCAL_CATEGORIES.protein,
    { energyKcal: 125, proteinG: 20.2, fatG: 4.2, carbohydrateG: 0 },
    ['一掌心', 100],
  ),
  makeLocalFood(
    'pork-tenderloin',
    '猪里脊',
    LOCAL_CATEGORIES.protein,
    { energyKcal: 155, proteinG: 20.3, fatG: 7.2, carbohydrateG: 0 },
    ['一掌心', 100],
  ),
  makeLocalFood(
    'chicken-leg',
    '鸡腿肉',
    LOCAL_CATEGORIES.protein,
    { energyKcal: 181, proteinG: 18.5, fatG: 11.2, carbohydrateG: 0 },
    ['一只', 120],
  ),
  makeLocalFood(
    'shrimp',
    '虾仁',
    LOCAL_CATEGORIES.protein,
    { energyKcal: 93, proteinG: 18.6, fatG: 1.7, carbohydrateG: 1.5 },
    ['一小碗', 100],
  ),
  makeLocalFood(
    'soy-milk',
    '豆浆',
    LOCAL_CATEGORIES.protein,
    { energyKcal: 31, proteinG: 3, fatG: 1.6, carbohydrateG: 1.2 },
    ['一杯', 250],
  ),
  makeLocalFood(
    'yogurt',
    '无糖酸奶',
    LOCAL_CATEGORIES.dairy,
    { energyKcal: 72, proteinG: 3.5, fatG: 3.3, carbohydrateG: 6.5 },
    ['一杯', 200],
  ),
  makeLocalFood(
    'cheese',
    '奶酪',
    LOCAL_CATEGORIES.dairy,
    { energyKcal: 328, proteinG: 25.4, fatG: 23.5, carbohydrateG: 3.5 },
    ['两片', 40],
  ),
  makeLocalFood(
    'walnut',
    '核桃',
    LOCAL_CATEGORIES.nut,
    { energyKcal: 646, proteinG: 14.9, fatG: 58.8, carbohydrateG: 18 },
    ['三颗', 30],
  ),
  makeLocalFood(
    'almond',
    '杏仁',
    LOCAL_CATEGORIES.nut,
    { energyKcal: 578, proteinG: 21.3, fatG: 49.4, carbohydrateG: 19.1 },
    ['一小把', 25],
  ),
  makeLocalFood(
    'peanut',
    '花生',
    LOCAL_CATEGORIES.nut,
    { energyKcal: 574, proteinG: 24.8, fatG: 44.3, carbohydrateG: 21.7 },
    ['一小把', 25],
  ),
  makeLocalFood(
    'orange',
    '橙子',
    LOCAL_CATEGORIES.fruit,
    { energyKcal: 48, proteinG: 0.8, fatG: 0.2, carbohydrateG: 11.1 },
    ['一个', 180],
  ),
  makeLocalFood(
    'kiwi',
    '猕猴桃',
    LOCAL_CATEGORIES.fruit,
    { energyKcal: 61, proteinG: 0.9, fatG: 0.5, carbohydrateG: 14 },
    ['一个', 100],
  ),
  makeLocalFood(
    'strawberry',
    '草莓',
    LOCAL_CATEGORIES.fruit,
    { energyKcal: 32, proteinG: 1, fatG: 0.2, carbohydrateG: 7.1 },
    ['一小碗', 150],
  ),
);

function localSearch(options: SearchFoodsOptions = {}): SearchFoodsResult {
  const query = options.query?.trim().toLowerCase();
  const filtered = LOCAL_FOOD_CATALOG.filter((food) => {
    if (query && !food.name.toLowerCase().includes(query)) return false;
    if (options.categoryId && food.category?.id !== options.categoryId) return false;
    return true;
  });
  const page = options.page || 1;
  const pageSize = options.pageSize || 20;
  return {
    items: filtered.slice((page - 1) * pageSize, page * pageSize),
    total: filtered.length,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
  };
}

export function buildFoodSearchQuery(options: SearchFoodsOptions = {}) {
  const params: string[] = [];
  const append = (key: string, value: string | number | undefined) => {
    if (value === undefined || value === '') return;
    params.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  };

  append('q', options.query);
  append('categoryId', options.categoryId);
  append('healthLight', options.healthLight);
  append('page', options.page);
  append('pageSize', options.pageSize);

  return params.length ? `?${params.join('&')}` : '';
}

/**
 * 搜索食物（增强版）
 * 支持：中文搜索、拼音搜索、分类筛选、健康等级筛选、分页
 */
export function searchFoods(options: SearchFoodsOptions = {}) {
  const queryString = buildFoodSearchQuery(options);
  return createMiniApiClient()
    .get<SearchFoodsResult>(`/foods/search${queryString}`)
    .catch(() => localSearch(options));
}

/**
 * 简单搜索（向后兼容）
 */
export function searchFoodsSimple(query = '') {
  return searchFoods({ query, pageSize: 30 }).then((result) => result.items);
}

/**
 * 获取食物详情
 */
export function getFoodById(foodId: string) {
  return createMiniApiClient()
    .get<FoodItem>(`/foods/${encodeURIComponent(foodId)}`)
    .then((food) => food || LOCAL_FOOD_CATALOG.find((item) => item.id === foodId) || null)
    .catch(() => LOCAL_FOOD_CATALOG.find((food) => food.id === foodId) || null);
}

export function getLocalFoodById(foodId: string) {
  return LOCAL_FOOD_CATALOG.find((food) => food.id === foodId) || null;
}

/**
 * 获取所有分类
 */
export function getCategories() {
  return createMiniApiClient().get<FoodCategory[]>('/foods/categories/list');
}

/**
 * 获取分类统计
 */
export function getCategoryStats() {
  return createMiniApiClient()
    .get<FoodCategory[]>('/foods/categories/stats')
    .catch(() =>
      [...new Map(LOCAL_FOOD_CATALOG.map((food) => [food.category?.id, food.category]))].map(
        ([id, category], index) => ({
          ...category!,
          id: id!,
          sortOrder: index,
          count: LOCAL_FOOD_CATALOG.filter((food) => food.category?.id === id).length,
        }),
      ),
    );
}

/**
 * 获取热门食物
 */
export function getPopularFoods(limit = 10) {
  return createMiniApiClient().get<FoodItem[]>(`/foods/popular/list?limit=${limit}`);
}

/**
 * 获取推荐食物
 */
export function getRecommendedFoods(limit = 10) {
  return createMiniApiClient().get<FoodItem[]>(`/foods/recommended/list?limit=${limit}`);
}

export function createMealEntry(input: {
  mealType: MealType;
  foodId: string;
  grams: number;
  recordedAt: string;
  note?: string;
  foodSnapshot?: FoodItem;
}) {
  const { foodSnapshot, ...request } = input;
  return createMiniApiClient()
    .post<MealEntry>('/meal-entries', request)
    .catch(() => saveLocalMealEntry(request, foodSnapshot));
}

export function loadMealEntries(date: string) {
  return createMiniApiClient()
    .get<MealEntry[]>(`/meal-entries?date=${encodeURIComponent(date)}`)
    .then((remote) => mergeMealEntries(remote, localMealEntries(date)))
    .catch(() => localMealEntries(date));
}

export function replaceMealEntry(
  recordId: string,
  input: {
    mealType?: MealType;
    foodId?: string;
    grams?: number;
    recordedAt?: string;
    note?: string;
  },
) {
  return createMiniApiClient().patch(`/meal-entries/${encodeURIComponent(recordId)}`, input);
}

export function deleteMealEntry(recordId: string) {
  return createMiniApiClient()
    .delete(`/meal-entries/${encodeURIComponent(recordId)}`)
    .catch(() => removeLocalMealEntry(recordId));
}

const LOCAL_MEAL_PREFIX = 'heban.local.meal-entries.';

function mealStorageKey() {
  const userId = uni.getStorageSync('heban.auth.user-id');
  return `${LOCAL_MEAL_PREFIX}${typeof userId === 'string' && userId ? `user.${userId}` : 'guest'}`;
}

function readLocalMeals(): MealEntry[] {
  const value = uni.getStorageSync(mealStorageKey());
  if (!value) return [];
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalMeals(entries: MealEntry[]) {
  uni.setStorageSync(mealStorageKey(), entries);
  return entries;
}

function saveLocalMealEntry(
  input: { mealType: MealType; foodId: string; grams: number; recordedAt: string; note?: string },
  snapshot?: FoodItem,
) {
  const food = snapshot || getLocalFoodById(input.foodId);
  if (!food) throw new Error('FOOD_SNAPSHOT_REQUIRED');
  const nutrition = calculateFoodNutrition(food, input.grams);
  const entry: MealEntry = {
    id: `local-meal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    mealType: input.mealType,
    foodId: food.id,
    foodNameSnapshot: food.name,
    grams: input.grams,
    ...nutrition,
    recordedAt: input.recordedAt,
    note: input.note || null,
  };
  writeLocalMeals([entry, ...readLocalMeals()]);
  return entry;
}

function localMealEntries(date: string) {
  return readLocalMeals().filter((entry) => entry.recordedAt.slice(0, 10) === date);
}

function mergeMealEntries(remote: MealEntry[], local: MealEntry[]) {
  const seen = new Set(remote.map((entry) => entry.id));
  return [...remote, ...local.filter((entry) => !seen.has(entry.id))];
}

function removeLocalMealEntry(recordId: string) {
  writeLocalMeals(readLocalMeals().filter((entry) => entry.id !== recordId));
}
