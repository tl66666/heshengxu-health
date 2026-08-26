import { describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import { FoodRecognitionModule } from './food-recognition.module.js';

describe('FoodRecognitionModule', () => {
  it('resolves the meal entry service required for confirmation', async () => {
    const module = await Test.createTestingModule({ imports: [FoodRecognitionModule] }).compile();
    expect(module).toBeDefined();
    await module.close();
  });
});
