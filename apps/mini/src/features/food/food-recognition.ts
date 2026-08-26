import { createApiClient } from '../../services/api-client.js';
import type { MealType } from './food.types.js';

export type RecognitionCandidate = {
  id: string;
  foodId: string | null;
  nameSnapshot: string;
  confidence: number;
  estimatedGrams: number;
  rank: number;
};

export type RecognitionJob = {
  id: string;
  status: 'queued' | 'processing' | 'succeeded' | 'failed' | 'confirmed';
  imageKey: string;
  candidates: RecognitionCandidate[];
  errorMessage: string | null;
};

export function defaultRecognitionCandidateId(candidates: Array<Pick<RecognitionCandidate, 'id' | 'rank'>>) {
  return [...candidates].sort((left, right) => left.rank - right.rank)[0]?.id || '';
}

function client() {
  return createApiClient({
    baseUrl: 'http://localhost:3000/api/v1',
    request: ({ url, method, data }) =>
      new Promise((resolve, reject) => {
        uni.request({
          url,
          method: method as never,
          data: data as Record<string, unknown>,
          header: { Authorization: 'Bearer dev-mini-user' },
          success: (response) => resolve({ statusCode: response.statusCode, data: response.data as never }),
          fail: reject,
        });
      }),
  });
}

export function createRecognitionJob(imageKey: string) {
  return client().post<RecognitionJob>('/food-recognition/jobs', { imageKey });
}

export function loadRecognitionJob(jobId: string) {
  return client().get<RecognitionJob>(`/food-recognition/jobs/${encodeURIComponent(jobId)}`);
}

export function confirmRecognition(input: { candidateId: string; mealType: MealType; grams: number; recordedAt: string; note?: string }) {
  return client().post('/food-recognition/confirm', input);
}
