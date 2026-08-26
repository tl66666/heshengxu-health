import type { MealType } from './health-loop.js';

export type FoodRecognitionStatus = 'queued' | 'processing' | 'succeeded' | 'failed' | 'confirmed';

export type FoodRecognitionCandidateDto = {
  id: string;
  foodId: string | null;
  name: string;
  confidence: number;
  estimatedGrams: number;
  rank: number;
};

export type FoodRecognitionJobDto = {
  id: string;
  status: FoodRecognitionStatus;
  imageKey: string;
  candidates: FoodRecognitionCandidateDto[];
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateFoodRecognitionJobRequest = { imageKey: string };
export type ConfirmFoodRecognitionRequest = {
  candidateId: string;
  mealType: MealType;
  grams: number;
  recordedAt: string;
  note?: string;
};
