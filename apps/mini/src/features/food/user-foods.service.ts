import { createMiniApiClient } from '../../services/mini-api.js';
import type { CreateUserFoodInput, UserFood } from './user-foods.types.js';

export async function listUserFoods(query = ''): Promise<UserFood[]> {
  const params = new URLSearchParams();
  const normalizedQuery = query.trim();
  if (normalizedQuery) params.set('q', normalizedQuery);
  const queryString = params.toString();

  try {
    return await createMiniApiClient().get<UserFood[]>(
      `/user-foods${queryString ? `?${queryString}` : ''}`,
    );
  } catch (error) {
    if (isNotFoundError(error)) return [];
    throw error;
  }
}

export function createUserFood(input: CreateUserFoodInput) {
  return createMiniApiClient().post<UserFood>('/user-foods', input);
}

export function deleteUserFood(id: string) {
  return createMiniApiClient().delete<void>(`/user-foods/${encodeURIComponent(id)}`);
}

function isNotFoundError(error: unknown) {
  return error instanceof Error && /^NOT_FOUND\s+\[/u.test(error.message);
}
