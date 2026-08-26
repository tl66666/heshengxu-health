import { Injectable } from '@nestjs/common';
import type { FoodRecognitionProvider, RecognitionProviderCandidate } from './food-recognition.provider.js';

@Injectable()
export class MockFoodRecognitionProvider implements FoodRecognitionProvider {
  async recognize(_input: { imageKey: string }): Promise<RecognitionProviderCandidate[]> {
    return [{ name: '鸡蛋', confidence: 0.78, estimatedGrams: 50 }];
  }
}
