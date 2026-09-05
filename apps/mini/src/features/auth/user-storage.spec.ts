import { afterEach, describe, expect, it, vi } from 'vitest';
import { userStorageKey } from './user-storage.js';

describe('userStorageKey', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('keeps guest storage backwards compatible', () => {
    vi.stubGlobal('uni', { getStorageSync: () => '' });
    expect(userStorageKey('water_daily_goal')).toBe('water_daily_goal');
  });

  it('isolates local records by authenticated user id', () => {
    vi.stubGlobal('uni', { getStorageSync: (key: string) => key === 'heban.auth.user-id' ? 'user-a' : '' });
    expect(userStorageKey('water_daily_goal')).toBe('water_daily_goal.user.user-a');
  });
});
