import { describe, expect, it } from 'vitest';
import { isTabRoute, ordinaryBackTarget, shouldConfirmOnboardingExit } from './navigation.js';
import appNavBarSource from './AppNavBar.vue?raw';

describe('navigation contracts', () => {
  it('recognizes tab routes even when a query selects a record type', () => {
    expect(isTabRoute('/pages/records/RecordsPage?type=sleep')).toBe(true);
    expect(isTabRoute('/pages/plan-setup/PlanSetupPage')).toBe(false);
  });

  it('returns a safe back target for ordinary pages', () => {
    expect(ordinaryBackTarget('/pages/plan-setup/PlanSetupPage')).toBe('/pages/plan/PlanPage');
    expect(ordinaryBackTarget('/pages/onboarding/OnboardingPage')).toBe(
      '/pages/bootstrap/BootstrapPage',
    );
    expect(ordinaryBackTarget('/pages/food-confirm/FoodConfirmPage')).toBe(
      '/pages/food-search/FoodSearchPage',
    );
    expect(ordinaryBackTarget('/pages/food-candidates/FoodCandidatesPage')).toBe(
      '/pages/food-recognition/FoodRecognitionPage',
    );
    expect(ordinaryBackTarget('/pages/weekly-review/WeeklyReviewPage')).toBe(
      '/pages/plan/PlanPage',
    );
  });

  it('only confirms exit from the first onboarding step', () => {
    expect(shouldConfirmOnboardingExit(0)).toBe(true);
    expect(shouldConfirmOnboardingExit(2)).toBe(false);
  });

  it('keeps secondary navigation actions neutral and circular', () => {
    expect(appNavBarSource).toMatch(/border-radius:\s*50%/);
    expect(appNavBarSource).toMatch(/border:\s*1rpx solid #dfe8df/);
    expect(appNavBarSource).toMatch(/background:\s*rgba\(255, 255, 255, 0\.72\)/);
    expect(appNavBarSource).not.toMatch(/background:\s*#eaf3eb/);
    expect(appNavBarSource).not.toMatch(/background:\s*#fff4ef/);
  });
});
