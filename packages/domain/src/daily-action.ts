export type DailyPlanKind = 'weight' | 'sleep';
export type DailyActionType =
  | 'record_sleep'
  | 'record_weight'
  | 'record_meal'
  | 'record_activity'
  | 'review_today';

export type DailyActionInput = {
  planKind: DailyPlanKind;
  hasSleepForPreviousNight: boolean;
  hasWeightToday: boolean;
  hasMealToday: boolean;
  hasActivityToday: boolean;
};

export type DailyAction = {
  type: DailyActionType;
  title: string;
  description: string;
  route: string;
};

const actions: Record<DailyActionType, DailyAction> = {
  record_sleep: {
    type: 'record_sleep',
    title: '补记昨晚睡眠',
    description: '记录睡眠时长和感受，帮助你看见自己的作息节律。',
    route: '/pages/records/RecordsPage?type=sleep',
  },
  record_weight: {
    type: 'record_weight',
    title: '记录今天体重',
    description: '连续记录比单次数值更有参考意义。',
    route: '/pages/records/RecordsPage?type=weight',
  },
  record_meal: {
    type: 'record_meal',
    title: '记录一餐饮食结构',
    description: '看看这一餐是否包含主食、蛋白质和蔬菜。',
    route: '/pages/records/RecordsPage?type=meal-structure',
  },
  record_activity: {
    type: 'record_activity',
    title: '记录今天的活动',
    description: '哪怕是短暂步行，也值得记下来。',
    route: '/pages/records/RecordsPage?type=activity',
  },
  review_today: {
    type: 'review_today',
    title: '今天记录得很完整',
    description: '看看计划进度，为明天留下一点空间。',
    route: '/pages/plan/PlanPage',
  },
};

export function selectDailyAction(input: DailyActionInput): DailyAction {
  if (!input.hasSleepForPreviousNight) return actions.record_sleep;
  if (input.planKind === 'weight' && !input.hasWeightToday) return actions.record_weight;
  if (!input.hasMealToday) return actions.record_meal;
  if (!input.hasActivityToday) return actions.record_activity;
  return actions.review_today;
}
