import { describe, expect, it } from 'vitest';
import { defaultRecognitionCandidateId } from './food-recognition.js';

describe('food recognition confirmation flow', () => {
  it('preselects the highest-ranked candidate without creating a meal record', () => {
    expect(defaultRecognitionCandidateId([{ id: 'second', rank: 2 }, { id: 'first', rank: 1 }])).toBe('first');
  });

  it('returns an empty selection when recognition has no candidates', () => {
    expect(defaultRecognitionCandidateId([])).toBe('');
  });
});
