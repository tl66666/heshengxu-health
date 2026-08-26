import { describe, expect, it } from 'vitest';
import { formFromTimeline, formToRequest, timelineFromToday } from './health-records.mapper.js';

const records = {
  timeZone: 'Asia/Shanghai' as const,
  weight: { id: 'w1', valueKg: 61.8, recordedAt: '2026-08-26T08:00:00.000Z', note: null },
  meals: [
    {
      id: 'm1',
      mealType: 'lunch' as const,
      hasStaple: true,
      hasProtein: true,
      hasVegetable: false,
      recordedAt: '2026-08-26T12:00:00.000Z',
      note: null,
    },
  ],
  activities: [],
  sleep: null,
};

describe('health records mapper', () => {
  it('maps a form to an API request', () => {
    expect(
      formToRequest({ type: 'weight', valueKg: '61.8', note: '' }, '2026-08-26T08:00:00.000Z'),
    ).toEqual({
      type: 'weight',
      data: { valueKg: 61.8, recordedAt: '2026-08-26T08:00:00.000Z', note: undefined },
    });
  });

  it('creates a sorted timeline and supports edit rehydration', () => {
    expect(timelineFromToday(records).map((item) => item.id)).toEqual(['m1', 'w1']);
    expect(formFromTimeline('meal-structure', records, 'm1')).toMatchObject({
      type: 'meal-structure',
      mealType: 'lunch',
      hasStaple: true,
    });
  });
});
