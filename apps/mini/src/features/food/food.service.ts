import { createMiniApiClient } from '../../services/mini-api.js';
import type { FoodItem, MealType } from './food.types.js';
import type { MealEntry } from './food.summary.js';
import type { UserFood, UserFoodSource } from './user-foods.types.js';

export type FoodSearchItem = FoodItem & {
  source: UserFoodSource;
  imageUrl?: string | null;
  userId?: string;
};

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

/**
 * 搜索食物（增强版）
 * 支持：中文搜索、拼音搜索、分类筛选、健康等级筛选、分页
 */
export function searchFoods(options: SearchFoodsOptions = {}) {
  const params = new URLSearchParams();

  if (options.query) params.append('q', options.query);
  if (options.categoryId) params.append('categoryId', options.categoryId);
  if (options.healthLight !== undefined) params.append('healthLight', String(options.healthLight));
  if (options.page) params.append('page', String(options.page));
  if (options.pageSize) params.append('pageSize', String(options.pageSize));

  const queryString = params.toString();
  return createMiniApiClient().get<SearchFoodsResult>(
    `/foods/search${queryString ? '?' + queryString : ''}`,
  );
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
  return createMiniApiClient().get<FoodItem>(`/foods/${encodeURIComponent(foodId)}`);
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
  return createMiniApiClient().get<FoodCategory[]>('/foods/categories/stats');
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

export function mergeFoodResults(
  personalFoods: UserFood[],
  catalogFoods: FoodItem[],
): FoodSearchItem[] {
  const personalResults = personalFoods.map(userFoodToSearchItem);
  const seenIds = new Set(personalResults.map((food) => food.id));
  const publicResults = catalogFoods
    .filter((food) => !seenIds.has(food.id))
    .map((food) => ({ ...food, source: 'catalog' as const }));

  return [...personalResults, ...publicResults];
}

function userFoodToSearchItem(food: UserFood): FoodSearchItem {
  return {
    id: food.id,
    userId: food.userId,
    name: food.name,
    imageUrl: food.imageUrl,
    source: food.source,
    brand: null,
    category: null,
    nutrition: {
      basisGrams: 100,
      energyKcal: food.energyKcal,
      proteinG: food.proteinG,
      fatG: food.fatG,
      carbohydrateG: food.carbohydrateG,
      dietaryFiberG: null,
      sodiumMg: null,
    },
    servings: [
      {
        id: `${food.id}:default`,
        label: food.defaultServingLabel,
        grams: food.defaultServingGrams,
      },
    ],
  };
}

export function createMealEntry(input: {
  mealType: MealType;
  foodId: string;
  grams: number;
  recordedAt: string;
  note?: string;
}) {
  return createMiniApiClient().post('/meal-entries', input);
}

export function loadMealEntries(date: string) {
  return createMiniApiClient().get<MealEntry[]>(`/meal-entries?date=${encodeURIComponent(date)}`);
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
  return createMiniApiClient().delete(`/meal-entries/${encodeURIComponent(recordId)}`);
}
