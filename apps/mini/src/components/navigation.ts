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
  return route.includes('plan-setup') ? '/pages/plan/PlanPage' : '/pages/bootstrap/BootstrapPage';
}

export function shouldConfirmOnboardingExit(step: number) {
  return step === 0;
}
