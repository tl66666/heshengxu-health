import type { HealthGoal } from './health-profile.types.js';
import { clearLocalPlan, loadLocalPlan, saveLocalPlan } from '../health-loop/local-demo.js';
import { addTemplatePlan, PLAN_TEMPLATES } from '../plans/plan-store.js';

const categoryByGoal: Record<HealthGoal, 'weight' | 'exercise' | 'sleep' | 'food' | 'mood'> = {
  weight_management: 'weight',
  weight_maintenance: 'weight',
  muscle_gain: 'exercise',
  sleep: 'sleep',
  energy: 'food',
  mood: 'mood',
};

export function syncHabitPlansForGoals(goals: HealthGoal[]) {
  for (const category of new Set(goals.map((goal) => categoryByGoal[goal]))) {
    const template = PLAN_TEMPLATES.find((item) => item.category === category);
    if (template) addTemplatePlan(template);
  }
}

export function syncPrimaryHealthPlan(primaryGoal: HealthGoal, targetWeightKg?: number) {
  const desired =
    primaryGoal === 'sleep'
      ? { kind: 'sleep' as const }
      : primaryGoal === 'weight_management' ||
          primaryGoal === 'weight_maintenance' ||
          primaryGoal === 'muscle_gain'
        ? {
            kind: 'weight' as const,
            direction:
              primaryGoal === 'muscle_gain'
                ? ('gain' as const)
                : primaryGoal === 'weight_maintenance'
                  ? ('maintain' as const)
                  : ('lose' as const),
          }
        : null;
  if (!desired) return clearLocalPlan();

  const current = loadLocalPlan();
  const targetMatches =
    targetWeightKg === undefined || current?.healthTarget.targetWeightKg === targetWeightKg;
  if (
    current?.kind === desired.kind &&
    (desired.kind === 'sleep' || current.healthTarget.direction === desired.direction) &&
    targetMatches
  ) {
    return current;
  }
  return saveLocalPlan({
    ...desired,
    startDate: localDate(),
    ...(desired.kind === 'weight' && Number.isFinite(targetWeightKg) && targetWeightKg! > 0
      ? { targetWeightKg }
      : {}),
  });
}

function localDate() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
