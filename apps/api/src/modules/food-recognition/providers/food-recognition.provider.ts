export type RecognitionProviderCandidate = {
  name: string;
  confidence: number;
  estimatedGrams: number;
  /** Nutrition estimate for the visible portion. It is normalized to 100g when saved. */
  estimatedEnergyKcal?: number;
  estimatedProteinG?: number;
  estimatedFatG?: number;
  estimatedCarbohydrateG?: number;
};

export interface FoodRecognitionProvider {
  readonly provider: string;
  readonly model: string;
  recognize(input: { imageKey: string; imageBase64?: string; contentType?: string }): Promise<RecognitionProviderCandidate[]>;
}
