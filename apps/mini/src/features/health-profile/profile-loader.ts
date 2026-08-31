import type { HealthGoal, HealthProfile } from './health-profile.types.js';

type LocalProfile = {
  displayName: string;
  birthDate?: string;
  sex?: 'female' | 'male' | 'unspecified';
  heightCm: number;
  weightKg: number;
  primaryGoal: string;
  goals?: string[];
};

export type ProfileDisplayResult =
  { source: 'remote' | 'local'; profile: HealthProfile } | { source: 'unavailable'; profile: null };

const healthGoals: HealthGoal[] = [
  'weight_management',
  'weight_maintenance',
  'muscle_gain',
  'sleep',
  'energy',
  'mood',
];

export async function loadProfileForDisplay(
  loadRemote: () => Promise<HealthProfile>,
  loadLocal: () => LocalProfile | null,
): Promise<ProfileDisplayResult> {
  const local = loadLocal();
  if (local) {
    const primaryGoal = healthGoals.includes(local.primaryGoal as HealthGoal)
      ? (local.primaryGoal as HealthGoal)
      : null;
    return {
      source: 'local',
      profile: {
        userId: 'local-profile',
        displayName: local.displayName,
        birthDate: local.birthDate || null,
        sex: local.sex || 'unspecified',
        heightCm: local.heightCm,
        weightKg: local.weightKg,
        primaryGoal,
        goals: (local.goals || [local.primaryGoal]).filter((goal): goal is HealthGoal =>
          healthGoals.includes(goal as HealthGoal),
        ),
      },
    };
  }
  try {
    return { source: 'remote', profile: await loadRemote() };
  } catch {
    return { source: 'unavailable', profile: null };
  }
}
