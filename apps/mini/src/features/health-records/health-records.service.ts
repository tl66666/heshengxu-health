import type { TodayRecordsDto } from '../../../../../packages/contracts/src/health-loop.js';
import { createMiniApiClient } from '../../services/mini-api.js';
import type { HealthRecordRequest } from './health-records.mapper.js';

const paths: Record<HealthRecordRequest['type'], string> = {
  weight: '/health-records/weights',
  'meal-structure': '/health-records/meal-structures',
  activity: '/health-records/activities',
  sleep: '/health-records/sleeps',
};

export function loadTodayRecords(date: string) {
  return createMiniApiClient().get<TodayRecordsDto>(`/health-records/today?date=${date}`);
}

export function createHealthRecord(request: HealthRecordRequest) {
  return createMiniApiClient().post(paths[request.type], request.data);
}

export function replaceHealthRecord(
  type: HealthRecordRequest['type'],
  recordId: string,
  data: Record<string, unknown>,
) {
  return createMiniApiClient().patch(`/health-records/${type}/${recordId}`, data);
}
