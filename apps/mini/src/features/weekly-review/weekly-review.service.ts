import { createApiClient } from '../../services/api-client.js';
import type { WeeklyReviewSummary } from './weekly-review.presentation.js';

export type WeeklyReview = WeeklyReviewSummary & {
  timeZone: 'Asia/Shanghai';
  range: { startDate: string; endDate: string };
  weight: {
    recordCount: number;
    firstKg?: number;
    lastKg?: number;
    changeKg?: number;
    points: Array<{ date: string; valueKg: number }>;
  };
  food: { recordedDayCount: number; entryCount: number; energyKcal: number };
  activity: { recordCount: number; durationMinutes: number };
  sleep: { recordCount: number; durationMinutes: number };
  plan: { taskCount: number; completedTaskCount: number };
};

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

export function loadWeeklyReview(date: string) {
  return createMiniClient().get<WeeklyReview>(
    `/health-insights/weekly?date=${encodeURIComponent(date)}`,
  );
}
