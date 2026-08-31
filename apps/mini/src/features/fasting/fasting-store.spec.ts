import { beforeEach, describe, expect, it, vi } from 'vitest';
import { durationMinutes, elapsedSeconds, finishFasting, formatDuration, formatRemaining, loadFastingPlan, progress, recordMeal, saveFastingPlan, startFasting } from './fasting-store.js';

const storage = new Map<string, unknown>();
vi.stubGlobal('uni', { getStorageSync: (key: string) => storage.get(key), setStorageSync: (key: string, value: unknown) => storage.set(key, value) });

describe('fasting store', () => {
  beforeEach(() => storage.clear());
  it('defaults to a 16:8 eating window', () => { const plan = loadFastingPlan(); expect(plan.mode).toBe('16:8'); expect(durationMinutes(plan)).toBe(8 * 60); });
  it('calculates progress and remaining time from the configured window', () => { const plan = saveFastingPlan({ eatingStart: '09:00', eatingEnd: '17:00' }); expect(progress(plan, new Date('2026-08-30T13:00:00'))).toBe(0.5); expect(formatRemaining(plan, new Date('2026-08-30T13:00:00'))).toBe('04:00:00'); });
  it('persists a real fasting session and calculates elapsed time', () => {
    const started = new Date('2026-08-30T09:00:00');
    const plan = startFasting(started);
    expect(plan.active).toBe(true);
    expect(elapsedSeconds(plan, new Date('2026-08-30T09:42:15'))).toBe(2535);
    expect(formatDuration(elapsedSeconds(plan, new Date('2026-08-30T09:42:15')))).toBe('00:42:15');
    const finished = finishFasting(new Date('2026-08-30T10:00:00'));
    expect(finished.active).toBe(false);
    expect(finished.sessions[0]?.endedAt).toBe(new Date('2026-08-30T10:00:00').toISOString());
  });
  it('records a meal timestamp and avoids duplicate entries for the same day', () => {
    const at = new Date('2026-08-30T12:18:00');
    const first = recordMeal(at);
    const second = recordMeal(new Date('2026-08-30T13:00:00'));
    expect(first.mealLogs).toHaveLength(1);
    expect(first.mealLogs[0]?.recordedAt).toBe(at.toISOString());
    expect(second.mealLogs).toHaveLength(1);
    expect(second.checkins).toEqual(['2026-08-30']);
  });
});
