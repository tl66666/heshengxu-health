import { describe, expect, it } from 'vitest';
import { getFoodById } from './food.service.js';

describe('food detail fallback', () => {
  it('keeps the local catalog available when the API returns no item', async () => {
    const previous = globalThis.uni;
    globalThis.uni = {
      request: (_options: any) => undefined,
    } as any;
    try {
      const food = await getFoodById('local-rice');
      expect(food?.name).toBe('米饭');
      expect(food?.nutrition.energyKcal).toBeGreaterThan(0);
    } finally {
      globalThis.uni = previous;
    }
  });
});
