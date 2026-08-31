export const HOME_CARD_DEFINITIONS = [
  {
    id: 'weight-plan',
    title: '体重管理方案',
    description: '查看当前体重、目标和完成进度',
    icon: '/static/icons/svg/scale.svg',
    group: '核心数据',
  },
  {
    id: 'food',
    title: '饮食记录',
    description: '记录餐次、热量和营养结构',
    icon: '/static/icons/svg/meal.svg',
    group: '核心数据',
  },
  {
    id: 'weight-record',
    title: '体重记录',
    description: '快速补记体重并查看趋势',
    icon: '/static/icons/svg/scale.svg',
    group: '核心数据',
  },
  {
    id: 'tracking',
    title: '健康追踪',
    description: '喝水、睡眠、运动和心情',
    icon: '/static/icons/watercolor/activity.png',
    group: '生活节律',
  },
  {
    id: 'fasting',
    title: '轻断食',
    description: '管理用餐窗口和今日节律',
    icon: '/static/icons/watercolor/fasting-clock.png',
    group: '生活节律',
  },
  {
    id: 'period',
    title: '经期',
    description: '记录周期并查看下一次预计日期',
    icon: '/static/icons/watercolor/menstruation.png',
    group: '生活节律',
  },
  {
    id: 'medication',
    title: '用药打卡',
    description: '按提醒完成每日用药记录',
    icon: '/static/icons/watercolor/medication.png',
    group: '生活节律',
  },
] as const;

export type HomeCardId = (typeof HOME_CARD_DEFINITIONS)[number]['id'];
export type HomeCardVisibility = Record<HomeCardId, boolean>;

const STORAGE_KEY = 'heban_home_card_visibility';

export function defaultHomeCardVisibility(): HomeCardVisibility {
  return Object.fromEntries(
    HOME_CARD_DEFINITIONS.map((card) => [card.id, true]),
  ) as HomeCardVisibility;
}

export function loadHomeCardVisibility(): HomeCardVisibility {
  const defaults = defaultHomeCardVisibility();
  try {
    const stored = uni.getStorageSync(STORAGE_KEY);
    if (!stored) return defaults;
    const parsed = typeof stored === 'string' ? JSON.parse(stored) : stored;
    for (const card of HOME_CARD_DEFINITIONS) {
      if (typeof parsed?.[card.id] === 'boolean') defaults[card.id] = parsed[card.id];
    }
  } catch {
    return defaults;
  }
  return defaults;
}

export function saveHomeCardVisibility(visibility: HomeCardVisibility) {
  uni.setStorageSync(STORAGE_KEY, JSON.stringify(visibility));
}

export function resetHomeCardVisibility() {
  const defaults = defaultHomeCardVisibility();
  saveHomeCardVisibility(defaults);
  return defaults;
}
