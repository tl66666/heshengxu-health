export type PlanKind = 'weight' | 'sleep';
export type PlanStatus = 'active' | 'paused' | 'archived';
export type WeightDirection = 'lose' | 'maintain' | 'gain';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type SleepQuality = 'poor' | 'fair' | 'good';
export type PlanTaskAction = 'record_weight' | 'record_meal' | 'walk_15_minutes' | 'record_sleep';
export type PlanTaskStatus = 'pending' | 'completed' | 'skipped';
export type HealthRecordType = 'weight' | 'meal-structure' | 'activity' | 'sleep';
export type DailyActionType =
  | 'setup_plan'
  | 'record_sleep'
  | 'record_weight'
  | 'record_meal'
  | 'record_activity'
  | 'review_today';

export type WeightRecordDto = {
  id: string;
  valueKg: number;
  recordedAt: string;
  note: string | null;
};

export type MealStructureRecordDto = {
  id: string;
  mealType: MealType;
  hasStaple: boolean;
  hasProtein: boolean;
  hasVegetable: boolean;
  recordedAt: string;
  note: string | null;
};

export type ActivityRecordDto = {
  id: string;
  activityType: string;
  durationMinutes: number;
  intensity: string | null;
  recordedAt: string;
  note: string | null;
};

export type SleepRecordDto = {
  id: string;
  durationMinutes: number;
  quality: SleepQuality;
  sleepAt: string | null;
  wakeAt: string | null;
  recordedAt: string;
  note: string | null;
};

export type TodayRecordsDto = {
  weight: WeightRecordDto | null;
  meals: MealStructureRecordDto[];
  activities: ActivityRecordDto[];
  sleep: SleepRecordDto | null;
  timeZone: 'Asia/Shanghai';
};

export type HealthTargetDto = {
  id: string;
  kind: PlanKind;
  direction: WeightDirection | null;
  startWeightKg?: number | null;
  targetWeightKg: number | null;
  startDate: string;
  status: PlanStatus;
};

export type PlanTaskDto = {
  id: string;
  scheduledFor: string;
  actionType: PlanTaskAction;
  status: PlanTaskStatus;
  completedAt: string | null;
};

export type PersonalPlanDto = {
  id: string;
  kind: PlanKind;
  status: PlanStatus;
  ruleVersion: string;
  healthTarget: HealthTargetDto;
  tasks: PlanTaskDto[];
};

export type DailyActionDto = {
  type: DailyActionType;
  title: string;
  description: string;
  route: string;
};

export type RecordingProgressDto = {
  completed: number;
  total: 4;
  hasWeight: boolean;
  hasMeal: boolean;
  hasActivity: boolean;
  hasSleep: boolean;
};

export type DailyHomeDto = {
  date: string;
  displayName: string | null;
  activePlan: PersonalPlanDto | null;
  todayRecords: TodayRecordsDto;
  todayTasks: PlanTaskDto[];
  dailyAction: DailyActionDto;
  recordingProgress: RecordingProgressDto;
};

export type SaveCurrentPlanRequest = {
  kind: PlanKind;
  direction?: WeightDirection;
  targetWeightKg?: number;
  startDate: string;
};

export type CreateWeightRecordRequest = {
  valueKg: number;
  recordedAt: string;
  note?: string;
};

export type CreateMealStructureRecordRequest = {
  mealType: MealType;
  hasStaple: boolean;
  hasProtein: boolean;
  hasVegetable: boolean;
  recordedAt: string;
  note?: string;
};

export type CreateActivityRecordRequest = {
  activityType: string;
  durationMinutes: number;
  intensity?: string;
  recordedAt: string;
  note?: string;
};

export type CreateSleepRecordRequest = {
  durationMinutes: number;
  quality: SleepQuality;
  sleepAt?: string;
  wakeAt?: string;
  recordedAt: string;
  note?: string;
};
