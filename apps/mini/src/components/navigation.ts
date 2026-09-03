const tabPrefixes = [
  '/pages/home/',
  '/pages/records/',
  '/pages/xuxu/',
  '/pages/community/',
  '/pages/plan/',
  '/pages/me/',
];

export function isTabRoute(url: string) {
  return tabPrefixes.some((prefix) => url.startsWith(prefix));
}

export function ordinaryBackTarget(route: string) {
  if (route.includes('food-confirm')) return '/pages/food-search/FoodSearchPage';
  if (route.includes('food-candidates')) return '/pages/food-recognition/FoodRecognitionPage';
  if (route.includes('plan-setup') || route.includes('weekly-review')) {
    return '/pages/plan/PlanPage';
  }
  return '/pages/bootstrap/BootstrapPage';
}

export function shouldConfirmOnboardingExit(step: number) {
  return step === 0;
}
