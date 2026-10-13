import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { weekDates, shanghaiDate } from './calendar.js';
import {
  savePlan,
  loadJournal,
  saveSession,
  deleteSession,
  saveEvidence,
  saveReview,
} from './store.js';
import { scoreWeek } from './score.js';
import { DEFAULT_PLAN, exerciseOptions } from './training.js';

describe('lean muscle', () => {
  const storage = new Map<string, unknown>();
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-18T12:00:00+08:00'));
    storage.clear();
    vi.stubGlobal('uni', {
      getStorageSync: (key: string) => storage.get(key),
      setStorageSync: (key: string, value: unknown) => storage.set(key, structuredClone(value)),
    });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });
  it('uses Shanghai dates and Monday weeks across months', () => {
    expect(shanghaiDate(new Date('2026-10-11T17:00:00Z'))).toBe('2026-10-12');
    expect(weekDates('2026-11-01')).toEqual([
      '2026-10-26',
      '2026-10-27',
      '2026-10-28',
      '2026-10-29',
      '2026-10-30',
      '2026-10-31',
      '2026-11-01',
    ]);
  });
  it('saves editable sessions without duplicate ids and rejects invalid sets', () => {
    const input = {
      date: '2026-10-12',
      durationMinutes: 20,
      exercises: [{ exerciseId: exerciseOptions[0]!.id, sets: [{ reps: 8, loadKg: 0 }] }],
      note: '',
    };
    const session = saveSession(input);
    saveSession({ ...input, id: session.id, durationMinutes: 25 });
    expect(loadJournal().sessions).toHaveLength(1);
    expect(loadJournal().sessions[0]!.durationMinutes).toBe(25);
    expect(() =>
      saveSession({
        ...input,
        exercises: [{ exerciseId: exerciseOptions[0]!.id, sets: [{ reps: -1, loadKg: 0 }] }],
      }),
    ).toThrow();
    deleteSession(session.id);
    expect(loadJournal().sessions).toHaveLength(0);
  });
  it('isolates journals and propagates storage failures', () => {
    storage.set('heban.auth.user-id', 'a');
    savePlan(DEFAULT_PLAN, '2026-10-12');
    storage.set('heban.auth.user-id', 'b');
    expect(loadJournal().plans).toEqual({});
    vi.stubGlobal('uni', {
      getStorageSync: () => '',
      setStorageSync: () => {
        throw new Error('full');
      },
    });
    expect(() => savePlan(DEFAULT_PLAN, '2026-10-12')).toThrow();
  });
  it('keeps missing evidence unknown and caps extra training', () => {
    savePlan(DEFAULT_PLAN, '2026-10-12');
    let score = scoreWeek(loadJournal(), {}, '2026-10-12');
    expect(score.total).toBeNull();
    expect(score.dimensions.map((d) => d.weight)).toEqual([35, 25, 25, 15]);
    for (const date of ['2026-10-12', '2026-10-13', '2026-10-14'])
      saveSession({
        date,
        durationMinutes: 20,
        exercises: [{ exerciseId: exerciseOptions[0]!.id, sets: [{ reps: 8, loadKg: 0 }] }],
        note: '',
      });
    score = scoreWeek(loadJournal(), {}, '2026-10-18');
    expect(score.dimensions[0]!.points).toBe(35);
  });
  it('does not count stale food confirmation and preserves past plan goals', () => {
    savePlan({ ...DEFAULT_PLAN, proteinG: 100 }, '2026-10-12');
    saveEvidence('2026-10-12', {
      foodFingerprint: 'old',
      foodComplete: true,
      balancedMeals: 1,
      mainMeals: 1,
    });
    const score = scoreWeek(
      loadJournal(),
      { '2026-10-12': { proteinG: 100, foodFingerprint: 'new', sleepMinutes: 480 } },
      '2026-10-18',
    );
    expect(score.dimensions[1]!.points).toBe(0);
    expect(score.dimensions[1]!.coverage).toBe(0);
    savePlan({ ...DEFAULT_PLAN, proteinG: 80 }, '2026-10-19');
    expect(loadJournal().plans['2026-10-12']!.proteinG).toBe(100);
  });
  it('allows revising a future plan but does not rewrite the current week', () => {
    savePlan(DEFAULT_PLAN, '2026-10-19');
    savePlan({ ...DEFAULT_PLAN, durationMinutes: 30 }, '2026-10-19');
    expect(loadJournal().plans['2026-10-19']!.durationMinutes).toBe(30);
    savePlan(DEFAULT_PLAN, '2026-10-12');
    expect(() => savePlan(DEFAULT_PLAN, '2026-10-12')).toThrow();
  });
  it('ignores malformed persisted plans without crashing score calculation', () => {
    storage.set('heban.lean-muscle.v1', {
      version: 1,
      plans: { '2026-10-12': { trainingDays: null } },
      sessions: [],
      evidence: {},
      reviews: {},
    });
    expect(() => scoreWeek(loadJournal(), {}, '2026-10-18')).not.toThrow();
    expect(loadJournal().plans).toEqual({});
  });
  it('gives a complete capped score using actual goals and recovery days', () => {
    const plan = {
      ...DEFAULT_PLAN,
      proteinG: 100,
      representativeId: exerciseOptions[0]!.id,
      representativeReps: 8,
      representativeLoadKg: 0,
    };
    savePlan(plan, '2026-10-12');
    const signals: Record<
      string,
      { proteinG: number; foodFingerprint: string; sleepMinutes: number }
    > = {};
    for (const date of weekDates('2026-10-12')) {
      signals[date] = { proteinG: 130, foodFingerprint: date, sleepMinutes: 600 };
      saveEvidence(date, {
        foodComplete: true,
        foodFingerprint: date,
        balancedMeals: 3,
        mainMeals: 3,
        activity: 'rest',
        recovered: true,
      });
    }
    for (const date of ['2026-10-12', '2026-10-15'])
      saveSession({
        date,
        durationMinutes: 20,
        exercises: [{ exerciseId: exerciseOptions[0]!.id, sets: [{ reps: 8, loadKg: 0 }] }],
        note: '',
      });
    saveReview('2026-10-12', '动作更熟悉了', '下周保留训练时间');
    expect(scoreWeek(loadJournal(), signals, '2026-10-18').total).toBe(100);
  });
  it('keeps future representative improvement possible after a partial first attempt', () => {
    savePlan(DEFAULT_PLAN, '2026-10-12');
    saveSession({
      date: '2026-10-12',
      durationMinutes: 20,
      exercises: [{ exerciseId: 'wall-pushup', sets: [{ reps: 4, loadKg: 0 }] }],
      note: '',
    });
    const score = scoreWeek(loadJournal(), {}, '2026-10-12');
    expect(score.dimensions[3]!.points).toBe(5);
    expect(score.dimensions[3]!.upper).toBe(15);
  });
  it('normalizes session timestamps and keeps valid sessions beside corrupt entries', () => {
    const session = saveSession({
      date: '2026-10-12',
      durationMinutes: 20,
      exercises: [{ exerciseId: 'wall-pushup', sets: [{ reps: 8, loadKg: 0 }] }],
      note: '',
    });
    const journal = loadJournal();
    storage.set('heban.lean-muscle.v1', {
      ...journal,
      sessions: [
        { ...session, recordedAt: { bad: true } },
        { ...session, id: 'lean-bad', exercises: [null] },
      ],
    });
    expect(loadJournal().sessions).toHaveLength(1);
    expect(loadJournal().sessions[0]!.recordedAt).toBe('2026-10-12T12:00:00+08:00');
  });
  it('keeps the real save time for a same-day training record', () => {
    const session = saveSession({
      date: '2026-10-18',
      durationMinutes: 20,
      exercises: [{ exerciseId: 'wall-pushup', sets: [{ reps: 8, loadKg: 0 }] }],
      note: '',
    });
    expect(session.recordedAt).toBe(new Date().toISOString());
    expect(loadJournal().sessions[0]!.recordedAt).toBe(session.recordedAt);
  });
});
