import { describe, expect, it } from 'vitest';
import { MockFoodRecognitionProvider } from './mock-food-recognition.provider.js';

describe('MockFoodRecognitionProvider', () => {
  it('returns candidates with confidence and estimated grams, never a meal entry', async () => {
    const result = await new MockFoodRecognitionProvider().recognize({ imageKey: 'local/test.jpg' });
    expect(result[0]).toMatchObject({ name: '鸡蛋', confidence: 0.78, estimatedGrams: 50 });
    expect(result).not.toHaveProperty('mealEntry');
  });
});
