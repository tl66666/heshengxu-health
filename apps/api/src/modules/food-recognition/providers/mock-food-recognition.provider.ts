import { Injectable } from '@nestjs/common';
import type {
  FoodRecognitionProvider,
  RecognitionProviderCandidate,
} from './food-recognition.provider.js';

@Injectable()
export class MockFoodRecognitionProvider implements FoodRecognitionProvider {
  readonly provider = 'mock';
  readonly model = 'food-recognition-mock-v1';

  async recognize(_input: { imageKey: string; imageBase64?: string; contentType?: string }): Promise<RecognitionProviderCandidate[]> {
    void _input;
    return [{ name: '鸡蛋', confidence: 0.78, estimatedGrams: 50 }];
  }
}
