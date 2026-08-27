import type {
  CreateActivityRecordRequest,
  CreateMealStructureRecordRequest,
  CreateSleepRecordRequest,
  CreateWeightRecordRequest,
  DailyHomeDto,
  HealthRecordType,
  PersonalPlanDto,
  SaveCurrentPlanRequest,
} from '../../../../../packages/contracts/src/health-loop.js';
import { createMiniApiClient } from '../../services/mini-api.js';

export type RecordRequest =
  | { type: 'weight'; data: CreateWeightRecordRequest }
  | { type: 'meal-structure'; data: CreateMealStructureRecordRequest }
  | { type: 'activity'; data: CreateActivityRecordRequest }
  | { type: 'sleep'; data: CreateSleepRecordRequest };

export function loadToday(date: string) {
  return createMiniApiClient().get<DailyHomeDto>(`/daily-home/today?date=${date}`);
}

export function loadPlan(date: string) {
  return createMiniApiClient().get<PersonalPlanDto | null>(`/health-plans/current?date=${date}`);
}

export function savePlan(data: SaveCurrentPlanRequest) {
  return createMiniApiClient().update<PersonalPlanDto>('/health-plans/current', data);
}

export function createRecord(request: RecordRequest) {
  const paths: Record<HealthRecordType, string> = {
    weight: '/health-records/weights',
    'meal-structure': '/health-records/meal-structures',
    activity: '/health-records/activities',
    sleep: '/health-records/sleeps',
  };
  return createMiniApiClient().post(paths[request.type], request.data);
}

export function replaceRecord(
  type: HealthRecordType,
  recordId: string,
  data: Record<string, unknown>,
) {
  return createMiniApiClient().patch(`/health-records/${type}/${recordId}`, data);
}

export function completeTask(taskId: string, status: 'completed' | 'skipped' = 'completed') {
  return createMiniApiClient().patch(`/health-plans/tasks/${taskId}`, { status });
}
