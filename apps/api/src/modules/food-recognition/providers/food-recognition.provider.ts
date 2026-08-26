export type RecognitionProviderCandidate = { name: string; confidence: number; estimatedGrams: number };

export interface FoodRecognitionProvider {
  recognize(input: { imageKey: string }): Promise<RecognitionProviderCandidate[]>;
}
