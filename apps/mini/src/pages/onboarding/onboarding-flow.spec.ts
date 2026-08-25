import { describe, expect, it } from 'vitest';
import { canAdvanceOnboarding, onboardingProgress } from './onboarding-flow.js';

describe('onboarding flow', () => {
  it('keeps the welcome step freely enterable and requires BMI before body details advance', () => {
    expect(canAdvanceOnboarding(0, null, '')).toBe(true);
    expect(canAdvanceOnboarding(2, null, '')).toBe(false);
    expect(canAdvanceOnboarding(2, 22.1, '')).toBe(true);
  });

  it('requires a health direction before profile confirmation', () => {
    expect(canAdvanceOnboarding(3, 22.1, '')).toBe(false);
    expect(canAdvanceOnboarding(3, 22.1, 'sleep')).toBe(true);
  });

  it('reports progress only after the welcome screen', () => {
    expect(onboardingProgress(0)).toBe(0);
    expect(onboardingProgress(1)).toBe(25);
    expect(onboardingProgress(4)).toBe(100);
  });
});
