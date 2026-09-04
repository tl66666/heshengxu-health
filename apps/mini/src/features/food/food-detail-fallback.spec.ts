import { describe, expect, it } from 'vitest';
import { getFoodById } from './food.service.js';

describe('food detail fallback', () => {
  it('keeps the local catalog available when the API returns no item', async () => {
    const scope = globalThis as typeof globalThis & { uni?: unknown };
    const previous = scope.uni;
    scope.uni = {
      request: (options: { fail?: (reason: Error) => void }) =>
        options.fail?.(new Error('offline')),
    } as any;
    try {
      const food = await getFoodById('local-rice');
      expect(food?.name).toBe('米饭');
      expect(food?.nutrition.energyKcal).toBeGreaterThan(0);
    } finally {
      scope.uni = previous;
    }
  });
});
