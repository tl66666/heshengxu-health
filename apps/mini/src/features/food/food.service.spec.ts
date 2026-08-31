import { describe, expect, it } from 'vitest';
import { buildFoodSearchQuery, searchFoods } from './food.service.js';

describe('food search query builder', () => {
  it('builds a query without relying on browser URLSearchParams', () => {
    expect(
      buildFoodSearchQuery({
        query: '鸡蛋',
        categoryId: 'egg',
        healthLight: 1,
        page: 2,
        pageSize: 20,
      }),
    ).toBe('?q=%E9%B8%A1%E8%9B%8B&categoryId=egg&healthLight=1&page=2&pageSize=20');
  });

  it('returns local catalog results when the API is unavailable', async () => {
    const result = await searchFoods({ query: '鸡蛋' });
    expect(result.items[0]?.name).toBe('鸡蛋');
  });

  it('keeps a useful common-food catalog for offline recording', async () => {
    const result = await searchFoods({ pageSize: 100 });
    expect(result.total).toBeGreaterThanOrEqual(30);
    expect(result.items.map((item) => item.name)).toEqual(
      expect.arrayContaining(['香蕉', '番茄', '三文鱼', '无糖酸奶', '核桃']),
    );
  });
});
