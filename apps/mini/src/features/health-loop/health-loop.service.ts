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
import { createApiClient } from '../../services/api-client.js';

export type RecordRequest =
  | { type: 'weight'; data: CreateWeightRecordRequest }
  | { type: 'meal-structure'; data: CreateMealStructureRecordRequest }
  | { type: 'activity'; data: CreateActivityRecordRequest }
  | { type: 'sleep'; data: CreateSleepRecordRequest };

function createMiniClient() {
  return createApiClient({
    baseUrl: 'http://localhost:3000/api/v1',
    request: ({ url, method, data }) =>
      new Promise((resolve, reject) => {
        uni.request({
          url,
          method: method as never,
          data: data as Record<string, unknown>,
          header: { Authorization: 'Bearer dev-mini-user' },
          success: (response) => resolve({ statusCode: response.statusCode, data: response.data as never }),
          fail: reject,
        });
      }),
  });
}

export function loadToday(date: string) {
  return createMiniClient().get<DailyHomeDto>(`/daily-home/today?date=${date}`);
}

export function loadPlan(date: string) {
  return createMiniClient().get<PersonalPlanDto | null>(`/health-plans/current?date=${date}`);
}

export function savePlan(data: SaveCurrentPlanRequest) {
  return createMiniClient().update<PersonalPlanDto>('/health-plans/current', data);
}

export function createRecord(request: RecordRequest) {
  const paths: Record<HealthRecordType, string> = {
    weight: '/health-records/weights',
    'meal-structure': '/health-records/meal-structures',
    activity: '/health-records/activities',
    sleep: '/health-records/sleeps',
  };
  return createMiniClient().post(paths[request.type], request.data);
}

export function replaceRecord(type: HealthRecordType, recordId: string, data: Record<string, unknown>) {
  return createMiniClient().patch(`/health-records/${type}/${recordId}`, data);
}

export function completeTask(taskId: string, status: 'completed' | 'skipped' = 'completed') {
  return createMiniClient().patch(`/health-plans/tasks/${taskId}`, { status });
}
