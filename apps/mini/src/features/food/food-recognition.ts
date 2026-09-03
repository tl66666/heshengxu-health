import { createMiniApiClient } from '../../services/mini-api.js';
import type { MealType } from './food.types.js';

export type RecognitionCandidate = {
  id: string;
  foodId: string | null;
  name: string;
  confidence: number;
  estimatedGrams: number;
  estimatedEnergyKcal?: number | null;
  estimatedProteinG?: number | null;
  estimatedFatG?: number | null;
  estimatedCarbohydrateG?: number | null;
  rank: number;
};

export type RecognitionJob = {
  id: string;
  status: 'queued' | 'processing' | 'succeeded' | 'failed' | 'confirmed';
  imageKey: string;
  errorCode: string | null;
  candidates: RecognitionCandidate[];
  errorMessage: string | null;
};

export type RecognitionUpload = {
  id: string;
  objectKey: string;
  contentType: 'image/jpeg' | 'image/png' | 'image/webp';
  sizeBytes: number;
  status: 'pending' | 'ready' | 'expired';
  expiresAt: string;
};

export function defaultRecognitionCandidateId(
  candidates: Array<Pick<RecognitionCandidate, 'id' | 'rank'>>,
) {
  return [...candidates].sort((left, right) => left.rank - right.rank)[0]?.id || '';
}

export function canStartRecognition(imagePath: string, hasConsent: boolean) {
  return Boolean(imagePath) && hasConsent;
}

export function imageContentType(imagePath: string): RecognitionUpload['contentType'] {
  if (/\.png(?:$|\?)/iu.test(imagePath)) return 'image/png';
  if (/\.webp(?:$|\?)/iu.test(imagePath)) return 'image/webp';
  return 'image/jpeg';
}

export function createRecognitionUpload(input: {
  contentType: RecognitionUpload['contentType'];
  sizeBytes: number;
}) {
  return createMiniApiClient().post<RecognitionUpload>('/food-recognition/uploads', input);
}

export function completeRecognitionUpload(uploadId: string) {
  return createMiniApiClient().post<RecognitionUpload>(
    `/food-recognition/uploads/${encodeURIComponent(uploadId)}/complete`,
    {},
  );
}

export function createRecognitionJob(uploadId: string) {
  return createMiniApiClient().post<RecognitionJob>('/food-recognition/jobs', { uploadId });
}

export function grantFoodRecognitionConsent() {
  return createMiniApiClient().post('/food-recognition/consents', {});
}

export function loadRecognitionJob(jobId: string) {
  return createMiniApiClient().get<RecognitionJob>(
    `/food-recognition/jobs/${encodeURIComponent(jobId)}`,
  );
}

export function confirmRecognition(input: {
  candidateId: string;
  mealType: MealType;
  grams: number;
  recordedAt: string;
  note?: string;
}) {
  return createMiniApiClient().post('/food-recognition/confirm', input);
}
