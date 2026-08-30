import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMiniApiClient } from '../../services/mini-api.js';
import { mergeFoodResults } from './food.service.js';
import { createUserFood, deleteUserFood, listUserFoods } from './user-foods.service.js';
import type { UserFood } from './user-foods.types.js';

vi.mock('../../services/mini-api.js', () => ({
  createMiniApiClient: vi.fn(),
}));

const personalFood: UserFood = {
  id: 'mine-1',
  userId: 'user-1',
  name: '燕麦杯',
  imageUrl: null,
  source: 'photo',
  energyKcal: 188,
  proteinG: 7,
  fatG: 5,
  carbohydrateG: 29,
  defaultServingLabel: '1 杯',
  defaultServingGrams: 180,
  createdAt: '2026-08-30T08:00:00.000Z',
  updatedAt: '2026-08-30T08:00:00.000Z',
};

describe('personal food mini client', () => {
  const get = vi.fn();
  const post = vi.fn();
  const remove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createMiniApiClient).mockReturnValue({
      get,
      post,
      delete: remove,
    } as never);
  });

  it('puts personal foods before public catalog foods and de-duplicates by id', () => {
    const merged = mergeFoodResults(
      [personalFood],
      [
        {
          id: 'mine-1',
          name: '公共燕麦杯',
          brand: null,
          category: null,
          nutrition: {
            basisGrams: 100,
            energyKcal: 160,
            proteinG: 6,
            fatG: 4,
            carbohydrateG: 28,
            dietaryFiberG: null,
            sodiumMg: null,
          },
          servings: [],
        },
        {
          id: 'public-1',
          name: '燕麦片',
          brand: null,
          category: null,
          nutrition: {
            basisGrams: 100,
            energyKcal: 367,
            proteinG: 13,
            fatG: 7,
            carbohydrateG: 61,
            dietaryFiberG: null,
            sodiumMg: null,
          },
          servings: [],
        },
      ],
    );

    expect(merged).toHaveLength(2);
    expect(merged).toMatchObject([
      { id: 'mine-1', source: 'photo', name: '燕麦杯' },
      { id: 'public-1', source: 'catalog', name: '燕麦片' },
    ]);
  });

  it('encodes the query when listing personal foods', async () => {
    get.mockResolvedValue([personalFood]);

    await expect(listUserFoods(' 燕麦 & 牛奶 ')).resolves.toEqual([personalFood]);
    expect(get).toHaveBeenCalledWith('/user-foods?q=%E7%87%95%E9%BA%A6+%26+%E7%89%9B%E5%A5%B6');
  });

  it('returns an empty list only when the personal-food endpoint is not found', async () => {
    get.mockRejectedValueOnce(new Error('NOT_FOUND [req-1]: route not found'));
    await expect(listUserFoods()).resolves.toEqual([]);

    get.mockRejectedValueOnce(new Error('UNAUTHORIZED [req-2]: please sign in'));
    await expect(listUserFoods()).rejects.toThrow('UNAUTHORIZED');
  });

  it('creates and deletes personal foods through the mini API client', async () => {
    const input = {
      name: personalFood.name,
      imageUrl: personalFood.imageUrl,
      source: personalFood.source,
      energyKcal: personalFood.energyKcal,
      proteinG: personalFood.proteinG,
      fatG: personalFood.fatG,
      carbohydrateG: personalFood.carbohydrateG,
      defaultServingLabel: personalFood.defaultServingLabel,
      defaultServingGrams: personalFood.defaultServingGrams,
    };
    post.mockResolvedValue(personalFood);
    remove.mockResolvedValue(undefined);

    await expect(createUserFood(input)).resolves.toEqual(personalFood);
    await expect(deleteUserFood(personalFood.id)).resolves.toBeUndefined();
    expect(post).toHaveBeenCalledWith('/user-foods', input);
    expect(remove).toHaveBeenCalledWith('/user-foods/mine-1');
  });
});
