import { describe, expect, it } from 'vitest';
import {
  canStartRecognition,
  defaultRecognitionCandidateId,
  imageContentType,
  recognitionCandidateToFood,
} from './food-recognition.js';

describe('food recognition confirmation flow', () => {
  it('preselects the highest-ranked candidate without creating a meal record', () => {
    expect(
      defaultRecognitionCandidateId([
        { id: 'second', rank: 2 },
        { id: 'first', rank: 1 },
      ]),
    ).toBe('first');
  });

  it('returns an empty selection when recognition has no candidates', () => {
    expect(defaultRecognitionCandidateId([])).toBe('');
  });

  it('requires both an image and explicit consent before recognition can start', () => {
    expect(canStartRecognition('', true)).toBe(false);
    expect(canStartRecognition('wxfile://meal.jpg', false)).toBe(false);
    expect(canStartRecognition('wxfile://meal.jpg', true)).toBe(true);
  });

  it('normalizes supported temporary image paths to an upload content type', () => {
    expect(imageContentType('wxfile://meal.png')).toBe('image/png');
    expect(imageContentType('wxfile://meal.webp')).toBe('image/webp');
    expect(imageContentType('wxfile://meal.jpg')).toBe('image/jpeg');
  });

  it('opens legacy recognition candidates without component details', () => {
    expect(recognitionCandidateToFood({
      id: 'legacy-1', foodId: null, name: '猪脚饭', confidence: 0.82,
      estimatedGrams: 520, estimatedEnergyKcal: 850, estimatedProteinG: 34,
      estimatedFatG: 32, estimatedCarbohydrateG: 105, rank: 1,
    })).toMatchObject({
      name: '猪脚饭',
      servings: [{ label: '识别份量', grams: 520 }],
      nutrition: { energyKcal: expect.closeTo(163.5, 0.1) },
    });
  });

  it('returns null instead of leaving confirmation loading when nutrition is incomplete', () => {
    expect(recognitionCandidateToFood({
      id: 'incomplete-1', foodId: null, name: '一份餐食', confidence: 0.5,
      estimatedGrams: 300, rank: 1,
    })).toBeNull();
  });
});
