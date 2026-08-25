export function onboardingProgress(step: number) {
  return step === 0 ? 0 : Math.min(step, 4) * 25;
}

export function canAdvanceOnboarding(step: number, bmi: number | null, primaryGoal: string) {
  if (step === 2) return bmi !== null;
  if (step === 3) return primaryGoal !== '';
  return true;
}
