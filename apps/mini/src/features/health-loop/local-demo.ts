import type {
  DailyHomeDto,
  MealType,
  PersonalPlanDto,
  SaveCurrentPlanRequest,
  SleepQuality,
} from '../../../../../packages/contracts/src/health-loop.js';

const PROFILE_KEY = 'heshengxu.local.health-profile';
const PLAN_KEY = 'heshengxu.local.health-plan';

export type LocalHealthProfile = {
  displayName: string;
  sex?: 'female' | 'male' | 'unspecified';
  birthDate?: string;
  heightCm: number;
  weightKg: number;
  primaryGoal: string;
  goals?: string[];
};

export function saveLocalProfile(profile: LocalHealthProfile) {
  uni.setStorageSync(PROFILE_KEY, profile);
}

export function loadLocalProfile(): LocalHealthProfile | null {
  const value = uni.getStorageSync(PROFILE_KEY) as Partial<LocalHealthProfile> | null;
  if (!value || !value.heightCm || !value.weightKg || !value.primaryGoal) return null;
  return {
    displayName: value.displayName || '新朋友',
    sex:
      value.sex === 'female' || value.sex === 'male' || value.sex === 'unspecified'
        ? value.sex
        : 'unspecified',
    birthDate: typeof value.birthDate === 'string' ? value.birthDate : '',
    heightCm: Number(value.heightCm),
    weightKg: Number(value.weightKg),
    primaryGoal: value.primaryGoal,
    goals: Array.isArray(value.goals) ? value.goals.map(String) : [value.primaryGoal],
  };
}

export function saveLocalPlan(request: SaveCurrentPlanRequest): PersonalPlanDto {
  const taskTypes =
    request.kind === 'sleep'
      ? ['record_sleep', 'walk_15_minutes']
      : ['record_weight', 'record_meal', 'walk_15_minutes'];
  const plan: PersonalPlanDto = {
    id: 'local-plan',
    kind: request.kind,
    status: 'active',
    ruleVersion: 'local-demo',
    healthTarget: {
      id: 'local-target',
      kind: request.kind,
      direction: request.direction || null,
      startWeightKg: request.kind === 'weight' ? (loadLocalProfile()?.weightKg ?? null) : null,
      targetWeightKg: request.targetWeightKg || null,
      startDate: request.startDate,
      status: 'active',
    },
    tasks: taskTypes.map((actionType, index) => ({
      id: `local-task-${index}`,
      scheduledFor: request.startDate,
      actionType: actionType as PersonalPlanDto['tasks'][number]['actionType'],
      status: 'pending',
      completedAt: null,
    })),
  };
  uni.setStorageSync(PLAN_KEY, plan);
  return plan;
}

export function loadLocalPlan(): PersonalPlanDto | null {
  return (uni.getStorageSync(PLAN_KEY) as PersonalPlanDto | null) || null;
}

export function clearLocalPlan() {
  uni.removeStorageSync(PLAN_KEY);
  return null;
}

export function resetLocalDemoData() {
  uni.removeStorageSync(PROFILE_KEY);
  uni.removeStorageSync(PLAN_KEY);
  const exactKeys = [
    'heban.health.records.v1',
    'heban-weight-records',
    'heban.local.fasting.v1',
    'heban.local.wellness-journal.v1',
    'heban.local.wellness-journal.v2',
    'heban_medication_reminders',
    'heban_medication_checkins',
    'heban_menstruation_cycle',
    'heban_menstruation_daily',
    'water_daily_goal',
    'water_daily_goal_custom',
    'water_user_info',
    'searchHistory',
    'pendingFoodSelection',
    'heban.food.daily-target-kcal',
    'heban_home_card_visibility',
  ];
  exactKeys.forEach((key) => uni.removeStorageSync(key));

  // Clear date-scoped records and per-user guest plans without touching the heban.auth.* namespace.
  try {
    const keys = uni.getStorageInfoSync?.().keys || [];
    keys
      .filter((key) =>
        /^water_\d{4}_\d{1,2}_\d{1,2}$/.test(key) ||
        key.startsWith('heshengxu.daily-home.') ||
        key.startsWith('heban.local.meal-entries.') ||
        key.startsWith('heban.local.habit-plans.'),
      )
      .forEach((key) => uni.removeStorageSync(key));
  } catch {
    // Older runtimes may not expose storage metadata; exact keys above still clear core data.
  }
}

export function completeLocalTask(taskId: string) {
  const plan = loadLocalPlan();
  if (!plan) return;
  const task = plan.tasks.find((item) => item.id === taskId);
  if (task) {
    task.status = 'completed';
    task.completedAt = new Date().toISOString();
  }
  uni.setStorageSync(PLAN_KEY, plan);
}

export function createLocalDailyHome(date: string): DailyHomeDto | null {
  const profile = loadLocalProfile();
  if (!profile) return null;
  const activePlan = loadLocalPlan();
  const weightRecords = readLocalWeightRecords();
  const localRecords = readLocalHealthRecords().filter(
    (record) => localRecordDate(record.recordedAt) === date,
  );
  const localWeight = localRecords.find((record) => record.type === 'weight');
  const latestWeight = localWeight
    ? {
        id: localWeight.id,
        weight: Number(localWeight.valueKg),
        recordedAt: localWeight.recordedAt,
        note: typeof localWeight.note === 'string' ? localWeight.note : undefined,
      }
    : weightRecords.find((record) => localRecordDate(record.recordedAt) === date);
  const meals = localRecords
    .filter((record) => record.type === 'meal-structure')
    .map((record) => ({
      id: record.id,
      mealType: record.mealType as MealType,
      hasStaple: Boolean(record.hasStaple),
      hasProtein: Boolean(record.hasProtein),
      hasVegetable: Boolean(record.hasVegetable),
      recordedAt: record.recordedAt,
      note: record.note || null,
    }));
  const activities = localRecords
    .filter((record) => record.type === 'activity')
    .map((record) => ({
      id: record.id,
      activityType: record.activityType,
      durationMinutes: Number(record.durationMinutes),
      intensity: record.intensity || null,
      recordedAt: record.recordedAt,
      note: record.note || null,
    }));
  const sleepRecord = localRecords.find((record) => record.type === 'sleep');
  const sleep = sleepRecord
    ? {
        id: sleepRecord.id,
        durationMinutes: Number(sleepRecord.durationMinutes),
        quality: sleepRecord.quality as SleepQuality,
        sleepAt: sleepRecord.sleepAt || null,
        wakeAt: sleepRecord.wakeAt || null,
        recordedAt: sleepRecord.recordedAt,
        note: sleepRecord.note || null,
      }
    : null;
  return {
    date,
    displayName: profile.displayName,
    activePlan,
    todayRecords: {
      weight: latestWeight
        ? {
            id: latestWeight.id,
            valueKg: latestWeight.weight,
            recordedAt: latestWeight.recordedAt,
            note: latestWeight.note || null,
          }
        : null,
      meals,
      activities,
      sleep,
      timeZone: 'Asia/Shanghai',
    },
    todayTasks: activePlan?.tasks || [],
    dailyAction: {
      type: activePlan ? 'review_today' : 'setup_plan',
      title: activePlan ? '今天的小行动' : '从一个小计划开始',
      description: activePlan
        ? '完成一件小事，就已经是在照顾自己。'
        : '选择体重或睡眠方向，让序序陪你慢慢建立节律。',
      route: activePlan ? '/pages/plan/PlanPage' : '/pages/plan-setup/PlanSetupPage',
    },
    recordingProgress: {
      completed:
        Number(Boolean(latestWeight)) +
        Number(meals.length > 0) +
        Number(activities.length > 0) +
        Number(Boolean(sleep)),
      total: 4,
      hasWeight: Boolean(latestWeight),
      hasMeal: meals.length > 0,
      hasActivity: activities.length > 0,
      hasSleep: Boolean(sleep),
    },
  };
}

type LocalWeightRecord = { id: string; weight: number; recordedAt: string; note?: string };

type LocalHealthRecord = {
  id: string;
  type: 'weight' | 'meal-structure' | 'activity' | 'sleep';
  recordedAt: string;
  [key: string]: unknown;
};

function readLocalHealthRecords(): LocalHealthRecord[] {
  try {
    const value = uni.getStorageSync('heban.health.records.v1');
    return Array.isArray(value) ? (value as LocalHealthRecord[]) : [];
  } catch {
    return [];
  }
}

function localRecordDate(value: string) {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp)
    ? ''
    : new Date(timestamp + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function readLocalWeightRecords(): LocalWeightRecord[] {
  try {
    const value = uni.getStorageSync('heban-weight-records');
    if (Array.isArray(value)) return value as LocalWeightRecord[];
  } catch {
    // Storage may be unavailable during the first render.
  }
  return [];
}
