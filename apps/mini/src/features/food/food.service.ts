import { createApiClient } from '../../services/api-client.js';
import type { FoodItem, MealType } from './food.types.js';

function createMiniClient() {
  return createApiClient({
    baseUrl: 'http://localhost:3000/api/v1',
    request: ({ url, method, data }) =>
      new Promise((resolve, reject) => {
        uni.request({
          url,
          method: method as never,
          data: data as Record<string, unknown>,
          header: { Authorization: 'Bearer dev-mini-user' },
          success: (response) => resolve({ statusCode: response.statusCode, data: response.data as never }),
          fail: reject,
        });
      }),
  });
}

export function searchFoods(query = '') {
  return createMiniClient().get<FoodItem[]>(`/foods/search?q=${encodeURIComponent(query)}`);
}

export function createMealEntry(input: { mealType: MealType; foodId: string; grams: number; recordedAt: string; note?: string }) {
  return createMiniClient().post('/meal-entries', input);
}
