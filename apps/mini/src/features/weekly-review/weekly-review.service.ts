import { createMiniApiClient } from '../../services/mini-api.js';
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

export function loadWeeklyReview(date: string) {
  return createMiniApiClient().get<WeeklyReview>(
    `/health-insights/weekly?date=${encodeURIComponent(date)}`,
  );
}
