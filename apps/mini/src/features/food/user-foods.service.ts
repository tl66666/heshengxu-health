import { createMiniApiClient } from '../../services/mini-api.js';
import type { CreateUserFoodInput, UserFood } from './user-foods.types.js';
import { userStorageKey } from '../auth/user-storage.js';

const USER_FOOD_PHOTOS_KEY = 'heban.user-food-photos.v1';

export async function listUserFoods(query = ''): Promise<UserFood[]> {
  const params = new URLSearchParams();
  const normalizedQuery = query.trim();
  if (normalizedQuery) params.set('q', normalizedQuery);
  const queryString = params.toString();

  try {
    const foods = await createMiniApiClient().get<UserFood[]>(
      `/user-foods${queryString ? `?${queryString}` : ''}`,
    );
    return withLocalUserFoodPhotos(foods);
  } catch (error) {
    if (isNotFoundError(error)) return [];
    throw error;
  }
}

export function createUserFood(input: CreateUserFoodInput) {
  return createMiniApiClient().post<UserFood>('/user-foods', input);
}

export function deleteUserFood(id: string) {
  return createMiniApiClient().delete<void>(`/user-foods/${encodeURIComponent(id)}`).then(() => {
    removeUserFoodPhoto(id);
  });
}

export async function persistUserFoodPhoto(userFoodId: string, tempFilePath: string) {
  if (!userFoodId || !tempFilePath) return '';
  const savedFilePath = await saveLocalFile(tempFilePath);
  const photos = readPhotoMap();
  uni.setStorageSync(userStorageKey(USER_FOOD_PHOTOS_KEY), {
    ...photos,
    [userFoodId]: savedFilePath,
  });
  return savedFilePath;
}

export function withLocalUserFoodPhotos(foods: UserFood[]) {
  const photos = readPhotoMap();
  return foods.map((food) => ({ ...food, imageUrl: photos[food.id] || food.imageUrl }));
}

function readPhotoMap(): Record<string, string> {
  try {
    const value = uni.getStorageSync(userStorageKey(USER_FOOD_PHOTOS_KEY));
    return value && typeof value === 'object' ? value as Record<string, string> : {};
  } catch {
    return {};
  }
}

function saveLocalFile(tempFilePath: string): Promise<string> {
  return new Promise((resolve) => {
    const saveFile = (uni as unknown as {
      saveFile?: (input: {
        tempFilePath: string;
        success: (result: { savedFilePath: string }) => void;
        fail: () => void;
      }) => void;
    }).saveFile;
    if (!saveFile) {
      resolve(tempFilePath);
      return;
    }
    saveFile({
      tempFilePath,
      success: ({ savedFilePath }) => resolve(savedFilePath || tempFilePath),
      fail: () => resolve(tempFilePath),
    });
  });
}

function removeUserFoodPhoto(id: string) {
  try {
    const photos = readPhotoMap();
    if (!photos[id]) return;
    const { [id]: removed, ...remaining } = photos;
    void removed;
    uni.setStorageSync(userStorageKey(USER_FOOD_PHOTOS_KEY), remaining);
  } catch {
    // Deleting the cloud food must not fail because local storage is unavailable.
  }
}

function isNotFoundError(error: unknown) {
  return error instanceof Error && /^NOT_FOUND\s+\[/u.test(error.message);
}
