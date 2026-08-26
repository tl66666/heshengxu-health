import type { TodayRecordsDto } from '../../../../../packages/contracts/src/health-loop.js';
import { createApiClient } from '../../services/api-client.js';
import type { HealthRecordRequest } from './health-records.mapper.js';

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
          success: (response) =>
            resolve({ statusCode: response.statusCode, data: response.data as never }),
          fail: reject,
        });
      }),
  });
}

const paths: Record<HealthRecordRequest['type'], string> = {
  weight: '/health-records/weights',
  'meal-structure': '/health-records/meal-structures',
  activity: '/health-records/activities',
  sleep: '/health-records/sleeps',
};

export function loadTodayRecords(date: string) {
  return createMiniClient().get<TodayRecordsDto>(`/health-records/today?date=${date}`);
}

export function createHealthRecord(request: HealthRecordRequest) {
  return createMiniClient().post(paths[request.type], request.data);
}

export function replaceHealthRecord(
  type: HealthRecordRequest['type'],
  recordId: string,
  data: Record<string, unknown>,
) {
  return createMiniClient().patch(`/health-records/${type}/${recordId}`, data);
}
