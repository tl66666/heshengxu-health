import { describe, expect, it } from 'vitest';
import {
  FOOD_RECOGNITION_FAILURE_CODE,
  FOOD_RECOGNITION_FAILURE_MESSAGE,
  safeRecognitionFailure,
} from './recognition-failure.js';

describe('safe recognition failure', () => {
  it('normalizes provider errors without exposing their message', () => {
    const result = safeRecognitionFailure(new Error('secret provider response and token'));

    expect(result).toEqual({
      code: FOOD_RECOGNITION_FAILURE_CODE,
      message: FOOD_RECOGNITION_FAILURE_MESSAGE,
    });
    expect(result.message).not.toContain('secret provider response');
  });
});
