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
    estimatedEnergyKcal?: number | null;
    estimatedProteinG?: number | null;
    estimatedFatG?: number | null;
    estimatedCarbohydrateG?: number | null;
    components?: unknown;
    uncertaintyNote?: string | null;
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
      estimatedEnergyKcal: candidate.estimatedEnergyKcal,
      estimatedProteinG: candidate.estimatedProteinG,
      estimatedFatG: candidate.estimatedFatG,
      estimatedCarbohydrateG: candidate.estimatedCarbohydrateG,
      components: normalizeComponents(candidate.components),
      uncertaintyNote: candidate.uncertaintyNote ?? null,
      rank: candidate.rank,
    })),
  };
}

function normalizeComponents(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((component) => {
    if (!component || typeof component !== 'object') return [];
    const item = component as Record<string, unknown>;
    if (typeof item.name !== 'string' || typeof item.estimatedGrams !== 'number' || typeof item.estimatedEnergyKcal !== 'number') return [];
    return [{ name: item.name, estimatedGrams: item.estimatedGrams, estimatedEnergyKcal: item.estimatedEnergyKcal }];
  });
}
