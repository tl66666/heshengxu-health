import type { HealthGoal } from './health-profile.types.js';

type EditableProfile = {
  displayName: string;
  sex: 'female' | 'male' | 'unspecified';
  birthDate: string;
  heightCm: string;
  weightKg: string;
  primaryGoal: HealthGoal | null;
  goals: HealthGoal[];
};

export type CompleteLocalProfile = {
  displayName: string;
  sex: 'female' | 'male' | 'unspecified';
  birthDate: string;
  heightCm: number;
  weightKg: number;
  primaryGoal: HealthGoal;
  goals: HealthGoal[];
};

export function localProfileFromEdit(input: EditableProfile): CompleteLocalProfile | null {
  const heightCm = Number(input.heightCm);
  const weightKg = Number(input.weightKg);
  if (!input.primaryGoal || !Number.isFinite(heightCm) || heightCm <= 0) return null;
  if (!Number.isFinite(weightKg) || weightKg <= 0) return null;

  return {
    displayName: input.displayName.trim() || '新朋友',
    sex: input.sex,
    birthDate: input.birthDate,
    heightCm,
    weightKg,
    primaryGoal: input.primaryGoal,
    goals: input.goals.length ? input.goals : [input.primaryGoal],
  };
}
