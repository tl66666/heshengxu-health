import type { MealType, SleepQuality } from '../../../../../packages/contracts/src/health-loop.js';

export type RecordForm =
  | { type: 'weight'; valueKg: string; note: string }
  | {
      type: 'meal-structure';
      mealType: MealType;
      hasStaple: boolean;
      hasProtein: boolean;
      hasVegetable: boolean;
      note: string;
    }
  | { type: 'activity'; activityType: string; durationMinutes: string; note: string }
  | { type: 'sleep'; durationMinutes: string; quality: SleepQuality; note: string };

export type RecordFormErrors = Partial<
  Record<'valueKg' | 'structure' | 'activityType' | 'durationMinutes', string>
>;

export type RecordTimelineItem = {
  id: string;
  type: RecordForm['type'];
  title: string;
  description: string;
  recordedAt: string;
};
