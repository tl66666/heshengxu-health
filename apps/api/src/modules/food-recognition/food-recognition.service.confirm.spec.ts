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
      components: [{ name: '面条', estimatedGrams: 260, estimatedEnergyKcal: 360 }],
      uncertaintyNote: '汤汁含油量按常见做法估算',
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
        name: '番茄鸡蛋汤面',
        estimatedEnergyKcal: 500,
        estimatedProteinG: 24,
        estimatedFatG: 12,
        estimatedCarbohydrateG: 70,
      }),
    ).resolves.toMatchObject({
      mealEntryId: 'entry-1',
      userFoodId: 'user-food-1',
      savedToLibrary: true,
    });

    expect(prisma.userFood.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        name: '番茄鸡蛋汤面',
        source: 'photo',
        energyKcal: expect.closeTo(131.6, 0.1),
        proteinG: expect.closeTo(6.3, 0.1),
        fatG: expect.closeTo(3.2, 0.1),
        carbohydrateG: expect.closeTo(18.4, 0.1),
      }),
    });
    expect(mealEntries.create).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ userFoodId: 'user-food-1', source: 'photo_confirmed' }),
    );
  });

  it('saves a recognized catalog match to the users own library when requested', async () => {
    const candidate = {
      id: 'candidate-catalog',
      jobId: 'job-catalog',
      foodId: 'catalog-rice',
      nameSnapshot: '米饭',
      estimatedGrams: 150,
      estimatedEnergyKcal: 174,
      estimatedProteinG: 3.9,
      estimatedFatG: 0.5,
      estimatedCarbohydrateG: 38.8,
      food: {
        id: 'catalog-rice',
        name: '米饭',
        nutrition: {
          basisGrams: 100,
          energyKcal: 116,
          proteinG: 2.6,
          fatG: 0.3,
          carbohydrateG: 25.9,
        },
      },
      job: { id: 'job-catalog' },
    };
    const prisma = {
      foodRecognitionCandidate: { findFirst: vi.fn().mockResolvedValue(candidate) },
      userFood: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'my-rice', name: '米饭' }),
      },
      foodRecognitionJob: { update: vi.fn().mockResolvedValue({}) },
    };
    const mealEntries = {
      create: vi.fn().mockResolvedValue({ id: 'entry-rice', userFoodId: 'my-rice' }),
    };
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
        candidateId: 'candidate-catalog',
        mealType: 'lunch',
        grams: 150,
        recordedAt: '2026-09-07T04:00:00.000Z',
        saveToLibrary: true,
      }),
    ).resolves.toMatchObject({ userFoodId: 'my-rice', savedToLibrary: true });

    expect(prisma.userFood.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        name: '米饭',
        source: 'photo',
        energyKcal: 116,
      }),
    });
    expect(mealEntries.create).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ userFoodId: 'my-rice' }),
    );
  });
});
