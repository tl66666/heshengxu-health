import { describe, expect, it } from 'vitest';
import {
  canStartRecognition,
  defaultRecognitionCandidateId,
  imageContentType,
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
});
