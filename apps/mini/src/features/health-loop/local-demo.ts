import type {
  DailyHomeDto,
  PersonalPlanDto,
  SaveCurrentPlanRequest,
} from '../../../../../packages/contracts/src/health-loop.js';

const PROFILE_KEY = 'heshengxu.local.health-profile';
const PLAN_KEY = 'heshengxu.local.health-plan';

export type LocalHealthProfile = {
  displayName: string;
  heightCm: number;
  weightKg: number;
  primaryGoal: string;
};

export function saveLocalProfile(profile: LocalHealthProfile) {
  uni.setStorageSync(PROFILE_KEY, profile);
}

export function loadLocalProfile(): LocalHealthProfile | null {
  const value = uni.getStorageSync(PROFILE_KEY) as Partial<LocalHealthProfile> | null;
  if (!value || !value.heightCm || !value.weightKg || !value.primaryGoal) return null;
  return {
    displayName: value.displayName || '新朋友',
    heightCm: Number(value.heightCm),
    weightKg: Number(value.weightKg),
    primaryGoal: value.primaryGoal,
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
  return {
    date,
    displayName: profile.displayName,
    activePlan,
    todayRecords: {
      weight: null,
      meals: [],
      activities: [],
      sleep: null,
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
      completed: 0,
      total: 4,
      hasWeight: false,
      hasMeal: false,
      hasActivity: false,
      hasSleep: false,
    },
  };
}
