const tabPrefixes = [
  '/pages/home/',
  '/pages/records/',
  '/pages/xuxu/',
  '/pages/plan/',
  '/pages/me/',
];

export function isTabRoute(url: string) {
  return tabPrefixes.some((prefix) => url.startsWith(prefix));
}

export function ordinaryBackTarget(route: string) {
  if (route.includes('food-confirm')) return '/pages/food-search/FoodSearchPage';
  if (route.includes('food-candidates')) return '/pages/food-recognition/FoodRecognitionPage';
  return route.includes('plan-setup') ? '/pages/plan/PlanPage' : '/pages/bootstrap/BootstrapPage';
}

export function shouldConfirmOnboardingExit(step: number) {
  return step === 0;
}
