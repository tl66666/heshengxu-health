import type { HealthGoal, HealthProfile } from './health-profile.types.js';

type LocalProfile = {
  displayName: string;
  heightCm: number;
  weightKg: number;
  primaryGoal: string;
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
  try {
    return { source: 'remote', profile: await loadRemote() };
  } catch {
    const local = loadLocal();
    if (!local) return { source: 'unavailable', profile: null };
    return {
      source: 'local',
      profile: {
        userId: 'local-preview',
        displayName: local.displayName,
        birthDate: null,
        sex: 'unspecified',
        heightCm: local.heightCm,
        weightKg: local.weightKg,
        primaryGoal: healthGoals.includes(local.primaryGoal as HealthGoal)
          ? (local.primaryGoal as HealthGoal)
          : null,
      },
    };
  }
}
