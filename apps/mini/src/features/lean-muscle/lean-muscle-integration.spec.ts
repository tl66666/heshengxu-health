import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadTodayRecords } from '../health-records/health-records.service.js';
import { saveSession, deleteSession } from './store.js';
import { foodFingerprint, loadWeekSignals } from './signals.js';
describe('lean muscle integration', () => {
  const storage = new Map<string, unknown>();
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-18T00:00:00Z'));
    storage.clear();
    vi.stubGlobal('uni', {
      getStorageSync: (key: string) => storage.get(key),
      setStorageSync: (key: string, value: unknown) => storage.set(key, value),
    });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });
  it('projects a single source session into the activity timeline and reflects edits and deletion', async () => {
    const input = {
      date: '2026-10-12',
      durationMinutes: 20,
      exercises: [{ exerciseId: 'wall-pushup', sets: [{ reps: 8, loadKg: 0 }] }],
      note: '',
    };
    const session = saveSession(input);
    expect((await loadTodayRecords(input.date)).activities).toHaveLength(1);
    saveSession({ ...input, id: session.id, durationMinutes: 30 });
    expect((await loadTodayRecords(input.date)).activities[0]!.durationMinutes).toBe(30);
    deleteSession(session.id);
    expect((await loadTodayRecords(input.date)).activities).toHaveLength(0);
  });
  it('makes food evidence independent of API ordering but sensitive to portions', () => {
    const a = {
      id: 'a',
      recordedAt: '2026-10-12',
      grams: 100,
      proteinG: 12,
      energyKcal: 80,
      foodNameSnapshot: '豆腐',
      mealType: 'lunch' as const,
      foodId: 'food-a',
      fatG: 3,
      carbohydrateG: 5,
    };
    const b = { ...a, id: 'b' };
    expect(foodFingerprint([a, b])).toBe(foodFingerprint([b, a]));
    expect(foodFingerprint([a])).not.toBe(foodFingerprint([{ ...a, grams: 200 }]));
    expect(foodFingerprint([a])).not.toBe(foodFingerprint([{ ...a, mealType: 'snack' }]));
  });
  it('keeps unavailable remote intake unknown instead of confirming zero', async () => {
    const signals = await loadWeekSignals('2026-10-12');
    expect(signals!['2026-10-12']!.foodValid).toBe(false);
    expect(signals!['2026-10-12']!.proteinG).toBeUndefined();
  });
});
