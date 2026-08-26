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

export type FoodRecognitionUploadStatus = 'pending' | 'ready' | 'expired';
export type FoodRecognitionUploadDto = {
  id: string;
  objectKey: string;
  contentType: 'image/jpeg' | 'image/png' | 'image/webp';
  sizeBytes: number;
  status: FoodRecognitionUploadStatus;
  expiresAt: string;
};
export type CreateFoodRecognitionUploadRequest = {
  contentType: FoodRecognitionUploadDto['contentType'];
  sizeBytes: number;
};
export type CreateFoodRecognitionJobRequest = { uploadId: string };
export type ConfirmFoodRecognitionRequest = {
  candidateId: string;
  mealType: MealType;
  grams: number;
  recordedAt: string;
  note?: string;
};
