import { describe, expect, it } from 'vitest';
import { recognitionJobDto } from './food-recognition.mapper.js';

describe('recognition job response mapping', () => {
  it('exposes candidates as names required by the shared API contract', () => {
    expect(
      recognitionJobDto({
        id: 'job-1',
        status: 'succeeded',
        imageKey: 'images/meal.jpg',
        errorCode: null,
        errorMessage: null,
        createdAt: new Date('2026-08-26T00:00:00Z'),
        updatedAt: new Date('2026-08-26T00:01:00Z'),
        candidates: [
          {
            id: 'candidate-1',
            foodId: 'food-1',
            nameSnapshot: '鸡蛋',
            confidence: 0.8,
            estimatedGrams: 50,
            rank: 1,
          },
        ],
      }),
    ).toMatchObject({ status: 'succeeded', candidates: [{ name: '鸡蛋', estimatedGrams: 50 }] });
  });
});
