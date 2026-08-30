export type ActivityIntensity = 'low' | 'medium' | 'high';

export type ActivityCatalogItem = {
  id: string;
  name: string;
  category: string;
  intensity: ActivityIntensity;
  met: number;
  icon: string;
};

/**
 * A small, curated set for the quick-record flow. MET values are representative
 * estimates; the UI should label calculated calories as estimates.
 */
export const activityCatalog: readonly ActivityCatalogItem[] = [
  {
    id: 'walk',
    name: '步行',
    category: '有氧',
    intensity: 'low',
    met: 3.5,
    icon: 'activity-walk',
  },
  {
    id: 'run',
    name: '跑步',
    category: '有氧',
    intensity: 'high',
    met: 8.3,
    icon: 'activity-run',
  },
  {
    id: 'cycle',
    name: '骑行',
    category: '有氧',
    intensity: 'medium',
    met: 7.5,
    icon: 'activity-cycle',
  },
  {
    id: 'rope',
    name: '跳绳',
    category: '有氧',
    intensity: 'high',
    met: 10,
    icon: 'activity-rope',
  },
  {
    id: 'strength',
    name: '力量训练',
    category: '力量',
    intensity: 'medium',
    met: 5,
    icon: 'activity-strength',
  },
  {
    id: 'yoga',
    name: '瑜伽',
    category: '身心',
    intensity: 'low',
    met: 2.5,
    icon: 'activity-yoga',
  },
  {
    id: 'ball',
    name: '球类运动',
    category: '球类',
    intensity: 'high',
    met: 7,
    icon: 'activity-ball',
  },
];

export function getActivityById(id: string): ActivityCatalogItem | undefined {
  return activityCatalog.find((item) => item.id === id);
}

const DEFAULT_WEIGHT_KG = 70;

export function estimateActivityCalories(input: {
  met: number;
  weightKg?: number;
  durationMinutes: number;
}): number {
  if (!Number.isFinite(input.met) || input.met <= 0) {
    throw new Error('运动 MET 需要大于 0');
  }

  if (!Number.isFinite(input.durationMinutes) || input.durationMinutes <= 0) {
    throw new Error('运动时长需要大于 0 分钟');
  }

  const weightKg = input.weightKg === undefined ? DEFAULT_WEIGHT_KG : input.weightKg;
  if (!Number.isFinite(weightKg) || weightKg <= 0) {
    throw new Error('体重需要大于 0 千克');
  }

  return Math.round((input.met * 3.5 * weightKg * input.durationMinutes) / 200);
}
