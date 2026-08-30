import { describe, expect, it } from 'vitest';
import {
  activityCatalog,
  estimateActivityCalories,
  getActivityById,
  type ActivityCatalogItem,
} from './activity-catalog.js';

describe('activity catalog', () => {
  it('includes the core activity categories', () => {
    expect(activityCatalog.map((item: ActivityCatalogItem) => item.id)).toEqual([
      'walk',
      'run',
      'cycle',
      'rope',
      'strength',
      'yoga',
      'ball',
    ]);
  });

  it('estimates calories with the supplied body weight', () => {
    expect(estimateActivityCalories({ met: 3.5, weightKg: 60, durationMinutes: 30 })).toBe(110);
  });

  it('uses the default body weight when none is supplied', () => {
    expect(estimateActivityCalories({ met: 3.5, durationMinutes: 30 })).toBe(129);
  });

  it('rejects a non-positive duration', () => {
    expect(() => estimateActivityCalories({ met: 3.5, durationMinutes: 0 })).toThrow(
      '运动时长需要大于 0 分钟',
    );
  });

  it('finds an activity by id and returns undefined for unknown ids', () => {
    expect(getActivityById('run')?.id).toBe('run');
    expect(getActivityById('unknown')).toBeUndefined();
  });
});
