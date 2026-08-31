import { describe, expect, it } from 'vitest';
import onboardingPageSource from './OnboardingPage.vue?raw';
import {
  canAdvanceOnboarding,
  onboardingProgress,
  toggleOnboardingGoal,
} from './onboarding-flow.js';

describe('onboarding flow', () => {
  it.skip('falls back between onboarding illustrations instead of stretching the avatar (v1 only)', () => {
    expect(onboardingPageSource).toContain(
      "heroImage.value = '/static/illustrations/onboarding-hero-vertical.png'",
    );
    expect(onboardingPageSource).not.toContain(
      "heroImage.value = '/static/illustrations/xuxu-avatar.jpg'",
    );
  });
  it('keeps the welcome step freely enterable and requires BMI before body details advance', () => {
    expect(canAdvanceOnboarding(0, null, [])).toBe(true);
    expect(canAdvanceOnboarding(2, null, [])).toBe(false);
    expect(canAdvanceOnboarding(2, 22.1, [])).toBe(true);
  });

  it('requires a health direction before profile confirmation', () => {
    expect(canAdvanceOnboarding(3, 22.1, [])).toBe(false);
    expect(canAdvanceOnboarding(3, 22.1, ['sleep'])).toBe(true);
    expect(canAdvanceOnboarding(3, 22.1, ['sleep', 'energy', 'mood'])).toBe(true);
  });

  it('reports progress only after the welcome screen', () => {
    expect(onboardingProgress(0)).toBe(0);
    expect(onboardingProgress(1)).toBe(25);
    expect(onboardingProgress(4)).toBe(100);
  });

  it('supports selecting, removing, and limiting health goals', () => {
    expect(toggleOnboardingGoal([], 'sleep').goals).toEqual(['sleep']);
    expect(toggleOnboardingGoal(['sleep'], 'sleep').goals).toEqual([]);
    expect(toggleOnboardingGoal(['sleep', 'energy', 'mood'], 'weight_management')).toEqual({
      goals: ['sleep', 'energy', 'mood'],
      limited: true,
    });
  });

  it('does not persist placeholder height or weight as user data', () => {
    expect(onboardingPageSource).not.toContain("form.heightCm = '168'");
    expect(onboardingPageSource).not.toContain("form.weightKg = '60.0'");
    expect(onboardingPageSource).toContain("note: '建档初始体重'");
  });
});
