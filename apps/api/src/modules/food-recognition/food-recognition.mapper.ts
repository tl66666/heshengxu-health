import type { FoodRecognitionJobDto } from '@heban/contracts';

type RecognitionJobSource = {
  id: string;
  status: FoodRecognitionJobDto['status'];
  imageKey: string;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
  candidates: Array<{
    id: string;
    foodId: string | null;
    nameSnapshot: string;
    confidence: number;
    estimatedGrams: number;
    rank: number;
  }>;
};

export function recognitionJobDto(job: RecognitionJobSource): FoodRecognitionJobDto {
  return {
    id: job.id,
    status: job.status,
    imageKey: job.imageKey,
    errorCode: job.errorCode,
    errorMessage: job.errorMessage,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
    candidates: job.candidates.map((candidate) => ({
      id: candidate.id,
      foodId: candidate.foodId,
      name: candidate.nameSnapshot,
      confidence: candidate.confidence,
      estimatedGrams: candidate.estimatedGrams,
      rank: candidate.rank,
    })),
  };
}
