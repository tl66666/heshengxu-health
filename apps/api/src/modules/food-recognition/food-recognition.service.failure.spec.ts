import { describe, expect, it, vi } from 'vitest';
import { FoodRecognitionService } from './food-recognition.service.js';
import {
  FOOD_RECOGNITION_FAILURE_CODE,
  FOOD_RECOGNITION_FAILURE_MESSAGE,
} from './recognition-failure.js';

describe('FoodRecognitionService failure handling', () => {
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
