import { describe, expect, it } from 'vitest';
import { buildWeeklyReview } from './weekly-review.js';

describe('buildWeeklyReview', () => {
  it('keeps actual records and reports ready after three recorded days', () => {
    const review = buildWeeklyReview({
      anchorDate: '2026-08-26',
      weights: [
        { recordedAt: '2026-08-24T00:00:00.000Z', valueKg: 62 },
        { recordedAt: '2026-08-26T00:00:00.000Z', valueKg: 61.6 },
      ],
      meals: [{ recordedAt: '2026-08-25T00:00:00.000Z', energyKcal: 420 }],
      activities: [{ recordedAt: '2026-08-26T00:00:00.000Z', durationMinutes: 30 }],
      sleeps: [],
      tasks: [{ status: 'completed' }, { status: 'pending' }],
    });

    expect(review.range).toEqual({ startDate: '2026-08-24', endDate: '2026-08-30' });
    expect(review.coverage).toEqual({ recordedDayCount: 3, requiredDayCount: 3, status: 'ready' });
    expect(review.weight).toMatchObject({ recordCount: 2, firstKg: 62, lastKg: 61.6, changeKg: -0.4 });
    expect(review.weight.points).toEqual([
      { date: '2026-08-24', valueKg: 62 },
      { date: '2026-08-26', valueKg: 61.6 },
    ]);
    expect(review.food).toEqual({ recordedDayCount: 1, entryCount: 1, energyKcal: 420 });
    expect(review.activity).toEqual({ recordCount: 1, durationMinutes: 30 });
    expect(review.plan).toEqual({ taskCount: 2, completedTaskCount: 1 });
  });

  it('does not create a trend from one weight record or count records outside the week', () => {
    const review = buildWeeklyReview({
      anchorDate: '2026-08-26',
      weights: [
        { recordedAt: '2026-08-26T00:00:00.000Z', valueKg: 61.6 },
        { recordedAt: '2026-08-31T16:00:00.000Z', valueKg: 61.2 },
      ],
      meals: [{ recordedAt: '2026-08-31T16:00:00.000Z', energyKcal: 900 }],
      activities: [],
      sleeps: [{ recordedAt: '2026-08-27T00:00:00.000Z', durationMinutes: 450 }],
      tasks: [],
    });

    expect(review.coverage).toEqual({ recordedDayCount: 2, requiredDayCount: 3, status: 'insufficient' });
    expect(review.weight).toEqual({
      recordCount: 1,
      points: [{ date: '2026-08-26', valueKg: 61.6 }],
    });
    expect(review.food).toEqual({ recordedDayCount: 0, entryCount: 0, energyKcal: 0 });
    expect(review.sleep).toEqual({ recordCount: 1, durationMinutes: 450 });
  });
});
