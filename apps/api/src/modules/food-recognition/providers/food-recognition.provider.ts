export type RecognitionProviderCandidate = {
  name: string;
  confidence: number;
  estimatedGrams: number;
};

export interface FoodRecognitionProvider {
  readonly provider: string;
  readonly model: string;
  recognize(input: { imageKey: string }): Promise<RecognitionProviderCandidate[]>;
}
