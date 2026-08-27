import { describe, expect, it } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { FoodImportService } from './food-import.service.js';

describe('FoodImportService', () => {
  const service = new FoodImportService();
  const license = { sourceName: 'owned dataset', sourceLicense: 'internal-use-v1' };

  it('requires an explicit data license before normalizing rows', () => {
    expect(() => service.normalizeRows([], undefined)).toThrow(BadRequestException);
  });

  it('normalizes nutrition fields and removes duplicate aliases', () => {
    const [food] = service.normalizeRows(
      [
        {
          name: ' 燕麦 ',
          energyKcal: 389,
          proteinG: 16.9,
          fatG: 6.9,
          carbohydrateG: 66.3,
          aliases: ['燕麦', ' 燕麦 '],
        },
      ],
      license,
    );
    expect(food?.name).toBe('燕麦');
    expect(food?.aliases).toEqual(['燕麦']);
    expect(food?.nutrition.basisGrams).toBe(100);
  });
});
