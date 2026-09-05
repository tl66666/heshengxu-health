import { describe, expect, it } from 'vitest';
import { isTabRoute, ordinaryBackTarget, shouldConfirmOnboardingExit } from './navigation.js';
import appNavBarSource from './AppNavBar.vue?raw';
import pagesConfig from '../pages.json' with { type: 'json' };

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

  it('falls back to relaunch when an ordinary page is the first page in the stack', () => {
    expect(appNavBarSource).toContain('uni.reLaunch({ url: ordinaryBackTarget(props.route) })');
    expect(appNavBarSource).not.toContain('uni.switchTab({ url: ordinaryBackTarget');
  });

  it('keeps secondary navigation actions neutral and circular', () => {
    expect(appNavBarSource).toMatch(/border-radius:\s*50%/);
    expect(appNavBarSource).toMatch(/border:\s*1rpx solid #dfe8df/);
    expect(appNavBarSource).toMatch(/background:\s*rgba\(255, 255, 255, 0\.72\)/);
    expect(appNavBarSource).not.toMatch(/background:\s*#eaf3eb/);
    expect(appNavBarSource).not.toMatch(/background:\s*#fff4ef/);
  });

  it('does not render a second native navigation bar on pages with AppNavBar', () => {
    const pages = pagesConfig.pages as Array<{
      path: string;
      style?: { navigationStyle?: string };
    }>;
    const appNavPages = [
      'pages/food-search/FoodSearchPage',
      'pages/food-confirm/FoodConfirmPage',
      'pages/food-recognition/FoodRecognitionPage',
      'pages/food-candidates/FoodCandidatesPage',
      'pages/profile/ProfilePage',
      'pages/profile-edit/ProfileEditPage',
      'pages/weekly-review/WeeklyReviewPage',
    ];

    for (const path of appNavPages) {
      expect(pages.find((page) => page.path === path)?.style?.navigationStyle).toBe('custom');
    }
  });

  it('hides the native tab bar only for App builds', async () => {
    const appSource = await import('../App.vue?raw');
    expect(appSource.default).toMatch(/hideTabBar\(\{ animation: false \}\)/u);
    expect(appSource.default).toMatch(/isAppRuntime\(\)/u);
  });
});
