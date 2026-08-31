import { beforeEach, describe, expect, it, vi } from 'vitest';
import { healthLoopState } from './health-loop.store.js';
import { loadLocalProfile, saveLocalProfile } from './local-demo.js';

const storage = new Map<string, unknown>();
vi.stubGlobal('uni', {
  getStorageSync: (key: string) => storage.get(key),
  setStorageSync: (key: string, value: unknown) => storage.set(key, value),
  removeStorageSync: (key: string) => storage.delete(key),
});

describe('health loop local profile source', () => {
  beforeEach(() => {
    storage.clear();
    healthLoopState.today.value = null;
    healthLoopState.plan.value = null;
  });

  it('round-trips every onboarding field through local storage', () => {
    saveLocalProfile({
      displayName: '小禾',
      sex: 'female',
      birthDate: '1998-05-20',
      heightCm: 168,
      weightKg: 56.2,
      primaryGoal: 'sleep',
      goals: ['sleep', 'mood'],
    });

    expect(loadLocalProfile()).toEqual({
      displayName: '小禾',
      sex: 'female',
      birthDate: '1998-05-20',
      heightCm: 168,
      weightKg: 56.2,
      primaryGoal: 'sleep',
      goals: ['sleep', 'mood'],
    });
  });

  it('rebuilds today from the latest profile instead of a stale home cache', async () => {
    const date = '2026-08-31';
    storage.set(`heshengxu.daily-home.${date}`, {
      date,
      displayName: '旧缓存',
      activePlan: null,
    });
    saveLocalProfile({
      displayName: '小禾',
      sex: 'female',
      birthDate: '1998-05-20',
      heightCm: 168,
      weightKg: 56.2,
      primaryGoal: 'sleep',
      goals: ['sleep', 'mood'],
    });

    await healthLoopState.loadToday(date, { force: true });

    expect(healthLoopState.today.value?.displayName).toBe('小禾');
  });
});
