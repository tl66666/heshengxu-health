import { createMiniApiClient } from '../../services/mini-api.js';
import { userStorageKey } from '../auth/user-storage.js';
import type { FoodItem, MealType } from './food.types.js';

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
  components?: Array<{
    name: string;
    estimatedGrams: number;
    estimatedEnergyKcal: number;
  }>;
  uncertaintyNote?: string | null;
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

export function recognitionCandidateToFood(candidate: RecognitionCandidate): FoodItem | null {
  const values = [
    candidate.estimatedEnergyKcal,
    candidate.estimatedProteinG,
    candidate.estimatedFatG,
    candidate.estimatedCarbohydrateG,
  ];
  if (!candidate.estimatedGrams || values.some((value) => value == null)) return null;
  const scale = 100 / candidate.estimatedGrams;
  const per100 = (value: number) => Math.round(value * scale * 10) / 10;
  return {
    id: `recognized-${candidate.id}`,
    name: candidate.name,
    brand: null,
    category: null,
    nutrition: {
      basisGrams: 100,
      energyKcal: per100(candidate.estimatedEnergyKcal!),
      proteinG: per100(candidate.estimatedProteinG!),
      fatG: per100(candidate.estimatedFatG!),
      carbohydrateG: per100(candidate.estimatedCarbohydrateG!),
      dietaryFiberG: null,
      sodiumMg: null,
    },
    servings: [{
      id: `recognized-serving-${candidate.id}`,
      label: '识别份量',
      grams: candidate.estimatedGrams,
    }],
  };
}

const RECOGNITION_CACHE_KEY = 'heban.food-recognition.jobs.v1';

export function getCachedRecognitionJob(jobId: string): RecognitionJob | null {
  try {
    const value = uni.getStorageSync(userStorageKey(RECOGNITION_CACHE_KEY));
    const jobs = value && typeof value === 'object' ? value as Record<string, RecognitionJob> : {};
    return jobs[jobId] ?? null;
  } catch {
    return null;
  }
}

function cacheRecognitionJob(job: RecognitionJob) {
  try {
    const key = userStorageKey(RECOGNITION_CACHE_KEY);
    const value = uni.getStorageSync(key);
    const jobs = value && typeof value === 'object' ? value as Record<string, RecognitionJob> : {};
    const next = { ...jobs, [job.id]: job };
    const recent = Object.fromEntries(Object.entries(next).slice(-5));
    uni.setStorageSync(key, recent);
  } catch {
    // Recognition still works when local storage is unavailable.
  }
  return job;
}

export async function analyzeFoodImage(input: { imageBase64: string; contentType: RecognitionUpload['contentType'] }) {
  return cacheRecognitionJob(
    await createMiniApiClient().post<RecognitionJob>('/food-recognition/analyze', input),
  );
}

export function grantFoodRecognitionConsent() {
  return createMiniApiClient().post('/food-recognition/consents', {});
}

export async function loadRecognitionJob(jobId: string) {
  try {
    return cacheRecognitionJob(await createMiniApiClient().get<RecognitionJob>(
      `/food-recognition/jobs/${encodeURIComponent(jobId)}`,
    ));
  } catch (error) {
    const cached = getCachedRecognitionJob(jobId);
    if (cached) return cached;
    throw error;
  }
}

export function confirmRecognition(input: {
  candidateId: string;
  mealType: MealType;
  grams: number;
  recordedAt: string;
  note?: string;
  saveToLibrary?: boolean;
  name?: string;
  estimatedEnergyKcal?: number;
  estimatedProteinG?: number;
  estimatedFatG?: number;
  estimatedCarbohydrateG?: number;
}) {
  return createMiniApiClient().post<{ userFoodId?: string | null }>('/food-recognition/confirm', input);
}
