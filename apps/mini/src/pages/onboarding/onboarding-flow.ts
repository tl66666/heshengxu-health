export function onboardingProgress(step: number) {
  return step === 0 ? 0 : Math.min(step, 4) * 25;
}

export function canAdvanceOnboarding(
  step: number,
  bmi: number | null,
  goals: string | readonly string[],
) {
  if (step === 2) return bmi !== null;
  if (step === 3) return Array.isArray(goals) ? goals.length > 0 : goals !== '';
  return true;
}

export function toggleOnboardingGoal(
  goals: readonly string[],
  goal: string,
  max = 3,
): { goals: string[]; limited: boolean } {
  if (goals.includes(goal)) {
    return { goals: goals.filter((item) => item !== goal), limited: false };
  }
  if (goals.length >= max) {
    return { goals: [...goals], limited: true };
  }
  return { goals: [...goals, goal], limited: false };
}
