import { describe, expect, it, vi } from 'vitest';
import { FoodRecognitionService } from './food-recognition.service.js';

describe('FoodRecognitionService.confirm', () => {
  it('creates a personal food for an unknown candidate and records the meal', async () => {
    const candidate = {
      id: 'candidate-1',
      jobId: 'job-1',
      foodId: null,
      nameSnapshot: '番茄鸡蛋面',
      confidence: 0.91,
      estimatedGrams: 380,
      estimatedEnergyKcal: 520,
      estimatedProteinG: 22,
      estimatedFatG: 14,
      estimatedCarbohydrateG: 72,
      rank: 1,
      food: null,
      job: { id: 'job-1' },
    };
    const createdUserFood = { id: 'user-food-1', name: '番茄鸡蛋面' };
    const prisma = {
      foodRecognitionCandidate: { findFirst: vi.fn().mockResolvedValue(candidate) },
      userFood: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue(createdUserFood),
      },
      foodRecognitionJob: { update: vi.fn().mockResolvedValue({}) },
    };
    const mealEntries = { create: vi.fn().mockResolvedValue({ id: 'entry-1', userFoodId: 'user-food-1' }) };
    const service = new FoodRecognitionService(
      prisma as never,
      {} as never,
      mealEntries as never,
      {} as never,
      {} as never,
      {} as never,
    );

    await expect(
      service.confirm('user-1', {
        candidateId: 'candidate-1',
        mealType: 'lunch',
        grams: 380,
        recordedAt: '2026-09-03T04:00:00.000Z',
      }),
    ).resolves.toMatchObject({ id: 'entry-1' });

    expect(prisma.userFood.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        name: '番茄鸡蛋面',
        source: 'photo',
        energyKcal: expect.closeTo(136.8, 0.1),
        proteinG: expect.closeTo(5.8, 0.1),
        fatG: expect.closeTo(3.7, 0.1),
        carbohydrateG: expect.closeTo(18.9, 0.1),
      }),
    });
    expect(mealEntries.create).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ userFoodId: 'user-food-1', source: 'photo_confirmed' }),
    );
  });
});
