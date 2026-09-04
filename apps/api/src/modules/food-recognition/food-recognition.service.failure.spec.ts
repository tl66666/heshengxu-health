import { describe, expect, it, vi } from 'vitest';
import { FoodRecognitionService } from './food-recognition.service.js';
import {
  FOOD_RECOGNITION_FAILURE_CODE,
  FOOD_RECOGNITION_FAILURE_MESSAGE,
} from './recognition-failure.js';

describe('FoodRecognitionService failure handling', () => {
  it('persists inline image candidates so the confirmation page can reload them', async () => {
    const now = new Date('2026-09-04T00:00:00Z');
    const prisma = {
      user: { upsert: vi.fn() },
      foodItem: { findFirst: vi.fn().mockResolvedValue({ id: 'food-1' }) },
      foodRecognitionCandidate: { createMany: vi.fn() },
      foodRecognitionJob: {
        create: vi.fn().mockResolvedValue({ id: 'job-inline' }),
        update: vi.fn().mockResolvedValue({
          id: 'job-inline',
          status: 'succeeded',
          imageKey: 'inline/user-1',
          errorCode: null,
          errorMessage: null,
          createdAt: now,
          updatedAt: now,
          candidates: [
            {
              id: 'candidate-1',
              foodId: 'food-1',
              nameSnapshot: '苹果',
              confidence: 0.96,
              estimatedGrams: 180,
              rank: 1,
            },
          ],
        }),
      },
    };
    const provider = {
      provider: 'test',
      model: 'vision-test',
      recognize: vi.fn().mockResolvedValue([
        { name: '苹果', confidence: 0.96, estimatedGrams: 180 },
      ]),
    };
    const consent = { assertGranted: vi.fn() };
    const audit = { record: vi.fn() };
    const service = new FoodRecognitionService(
      prisma as never,
      provider,
      {} as never,
      consent as never,
      audit as never,
      {} as never,
    );

    await expect(
      service.analyze('user-1', { contentType: 'image/jpeg', imageBase64: 'aGVsbG8=' }),
    ).resolves.toMatchObject({ id: 'job-inline', status: 'succeeded' });
    expect(provider.recognize).toHaveBeenCalledWith({
      imageKey: expect.stringMatching(/^inline\/user-1\/\d+$/),
      imageBase64: 'aGVsbG8=',
      contentType: 'image/jpeg',
    });
    expect(prisma.foodRecognitionCandidate.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          jobId: 'job-inline',
          foodId: 'food-1',
          nameSnapshot: '苹果',
          estimatedGrams: 180,
          rank: 1,
        }),
      ],
    });
  });

  it('stores a safe failure and never creates a meal entry when provider throws', async () => {
    const failedJob = {
      id: 'job-failed',
      status: 'failed',
      imageKey: 'mock/image.jpg',
      errorCode: FOOD_RECOGNITION_FAILURE_CODE,
      errorMessage: FOOD_RECOGNITION_FAILURE_MESSAGE,
      createdAt: new Date('2026-08-26T00:00:00Z'),
      updatedAt: new Date('2026-08-26T00:01:00Z'),
      candidates: [],
    };
    const prisma = {
      user: { upsert: vi.fn() },
      foodRecognitionUpload: {
        findFirst: vi.fn().mockResolvedValue({ id: 'upload-1', objectKey: 'mock/image.jpg' }),
      },
      foodRecognitionJob: {
        create: vi.fn().mockResolvedValue({ id: failedJob.id }),
        update: vi.fn().mockResolvedValue(failedJob),
        findUniqueOrThrow: vi.fn().mockResolvedValue(failedJob),
      },
    };
    const provider = {
      provider: 'test',
      model: 'test-failing-provider',
      recognize: vi.fn().mockRejectedValue(new Error('provider token leaked')),
    };
    const mealEntries = { create: vi.fn() };
    const consent = { assertGranted: vi.fn() };
    const audit = { record: vi.fn() };
    const storage = { createObjectKey: vi.fn() };
    const service = new FoodRecognitionService(
      prisma as never,
      provider,
      mealEntries as never,
      consent as never,
      audit as never,
      storage as never,
    );

    const result = await service.create('user-1', 'upload-1');

    expect(result).toMatchObject({
      status: 'failed',
      errorCode: FOOD_RECOGNITION_FAILURE_CODE,
      errorMessage: FOOD_RECOGNITION_FAILURE_MESSAGE,
    });
    expect(result.errorMessage).not.toContain('provider token leaked');
    expect(prisma.foodRecognitionJob.update).toHaveBeenCalledWith({
      where: { id: failedJob.id },
      data: {
        status: 'failed',
        errorCode: FOOD_RECOGNITION_FAILURE_CODE,
        errorMessage: FOOD_RECOGNITION_FAILURE_MESSAGE,
      },
    });
    expect(mealEntries.create).not.toHaveBeenCalled();
  });
});
