import type {
  HealthRecordType,
  RecordingProgressDto,
} from '../../../../../packages/contracts/src/health-loop.js';

export function recordPresentation(
  type: HealthRecordType,
  progress: Omit<RecordingProgressDto, 'completed' | 'total'>,
) {
  const hasCurrentType = {
    weight: progress.hasWeight,
    'meal-structure': progress.hasMeal,
    activity: progress.hasActivity,
    sleep: progress.hasSleep,
  }[type];
  return {
    showReminder: !hasCurrentType,
    isEmpty:
      !progress.hasWeight && !progress.hasMeal && !progress.hasActivity && !progress.hasSleep,
  };
}
