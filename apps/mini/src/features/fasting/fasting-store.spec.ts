import { beforeEach, describe, expect, it, vi } from 'vitest';
import { durationMinutes, formatRemaining, loadFastingPlan, progress, saveFastingPlan } from './fasting-store.js';

const storage = new Map<string, unknown>();
vi.stubGlobal('uni', { getStorageSync: (key: string) => storage.get(key), setStorageSync: (key: string, value: unknown) => storage.set(key, value) });

describe('fasting store', () => {
  beforeEach(() => storage.clear());
  it('defaults to a 16:8 eating window', () => { const plan = loadFastingPlan(); expect(plan.mode).toBe('16:8'); expect(durationMinutes(plan)).toBe(8 * 60); });
  it('calculates progress and remaining time from the configured window', () => { const plan = saveFastingPlan({ eatingStart: '09:00', eatingEnd: '17:00' }); expect(progress(plan, new Date('2026-08-30T13:00:00'))).toBe(0.5); expect(formatRemaining(plan, new Date('2026-08-30T13:00:00'))).toBe('04:00:00'); });
});
