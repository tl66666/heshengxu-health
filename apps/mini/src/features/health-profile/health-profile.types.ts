export type HealthGoal =
  'weight_management' | 'weight_maintenance' | 'muscle_gain' | 'sleep' | 'energy' | 'mood';

export type HealthProfile = {
  userId: string;
  displayName: string | null;
  birthDate: string | null;
  sex: 'female' | 'male' | 'unspecified';
  heightCm: number | null;
  weightKg: number | null;
  primaryGoal: HealthGoal | null;
};

export const goalLabels: Record<HealthGoal, string> = {
  weight_management: '减脂与体重管理',
  weight_maintenance: '保持当前状态',
  muscle_gain: '力量与体能',
  sleep: '睡眠与精力',
  energy: '饮食与活力',
  mood: '情绪与压力',
};

export const sexLabels = { female: '女性', male: '男性', unspecified: '暂不说明' } as const;
