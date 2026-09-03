import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadLocalPlan, saveLocalPlan } from '../health-loop/local-demo.js';
import { loadHabitPlans } from '../plans/plan-store.js';
import { syncHabitPlansForGoals, syncPrimaryHealthPlan } from './health-goal-sync.js';

const storage = new Map<string, unknown>();
vi.stubGlobal('uni', {
  getStorageSync: (key: string) => storage.get(key),
  setStorageSync: (key: string, value: unknown) => storage.set(key, value),
  removeStorageSync: (key: string) => storage.delete(key),
});

describe('health goal synchronization', () => {
  beforeEach(() => storage.clear());

  it('creates one real habit plan for every selected feature category', () => {
    syncHabitPlansForGoals(['weight_management', 'muscle_gain', 'sleep', 'energy', 'mood']);
    syncHabitPlansForGoals(['weight_maintenance', 'sleep']);

    expect(
      loadHabitPlans()
        .map((plan) => plan.category)
        .sort(),
    ).toEqual(['exercise', 'food', 'mood', 'sleep', 'weight']);
  });

  it('maps the primary goal to the matching local health plan', () => {
    expect(syncPrimaryHealthPlan('weight_management')?.healthTarget.direction).toBe('lose');
    expect(syncPrimaryHealthPlan('weight_maintenance')?.healthTarget.direction).toBe('maintain');
    expect(syncPrimaryHealthPlan('muscle_gain')?.healthTarget.direction).toBe('gain');
    expect(syncPrimaryHealthPlan('sleep')?.kind).toBe('sleep');
  });

  it('persists a target weight when onboarding finishes with a weight goal', () => {
    expect(syncPrimaryHealthPlan('weight_management', 56)?.healthTarget.targetWeightKg).toBe(56);
  });

  it('updates an existing matching plan when the target changes', () => {
    syncPrimaryHealthPlan('weight_management', 56);
    expect(syncPrimaryHealthPlan('weight_management', 54)?.healthTarget.targetWeightKg).toBe(54);
  });

  it('keeps an existing matching target instead of erasing user settings', () => {
    saveLocalPlan({
      kind: 'weight',
      direction: 'lose',
      targetWeightKg: 52,
      startDate: '2026-08-01',
    });

    syncPrimaryHealthPlan('weight_management');

    expect(loadLocalPlan()?.healthTarget.targetWeightKg).toBe(52);
    expect(loadLocalPlan()?.healthTarget.startDate).toBe('2026-08-01');
  });

  it('removes a stale primary plan when the new primary goal uses habit plans', () => {
    saveLocalPlan({ kind: 'weight', direction: 'lose', startDate: '2026-08-01' });

    expect(syncPrimaryHealthPlan('mood')).toBeNull();
    expect(loadLocalPlan()).toBeNull();
  });
});
