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
  goals?: HealthGoal[];
};

export const goalLabels: Record<HealthGoal, string> = {
  weight_management: '减脂与体重管理',
  weight_maintenance: '保持当前状态',
  muscle_gain: '增肌与体能',
  sleep: '改善睡眠',
  energy: '提升精力',
  mood: '情绪与压力',
};

export const goalDetails: Record<HealthGoal, string> = {
  weight_management: '关注体重趋势、饮食结构和日常活动',
  weight_maintenance: '稳定体重和生活节律，减少大幅波动',
  muscle_gain: '结合力量活动与均衡饮食增强体能',
  sleep: '记录作息和睡眠感受，逐步稳定节律',
  energy: '从饮食、喝水和活动中观察精力变化',
  mood: '记录情绪与压力，留意自己的心理感受',
};

export const goalRoutes: Record<HealthGoal, string> = {
  weight_management: '/pages/weight/WeightDetailPage?view=progress',
  weight_maintenance: '/pages/weight/WeightDetailPage?view=progress',
  muscle_gain: '/pages/activity/ActivityDetailPage',
  sleep: '/pages/sleep/SleepDetailPage',
  energy: '/pages/food/FoodDetailPage',
  mood: '/pages/mood/MoodDetailPage',
};

export const sexLabels = { female: '女性', male: '男性', unspecified: '暂不说明' } as const;
