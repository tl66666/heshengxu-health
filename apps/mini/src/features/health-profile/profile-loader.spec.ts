import { describe, expect, it } from 'vitest';
import { loadProfileForDisplay } from './profile-loader.js';

describe('loadProfileForDisplay', () => {
  it('uses the complete local onboarding profile even when the API returns stale data', async () => {
    const result = await loadProfileForDisplay(
      async () => ({
        userId: 'remote-user',
        displayName: '旧档案',
        birthDate: null,
        sex: 'unspecified',
        heightCm: 160,
        weightKg: 60,
        primaryGoal: 'weight_maintenance',
      }),
      () => ({
        displayName: '小禾',
        sex: 'female',
        birthDate: '1998-05-20',
        heightCm: 168,
        weightKg: 56.2,
        primaryGoal: 'weight_management',
        goals: ['weight_management', 'sleep'],
      }),
    );

    expect(result).toEqual({
      source: 'local',
      profile: {
        userId: 'local-profile',
        displayName: '小禾',
        birthDate: '1998-05-20',
        sex: 'female',
        heightCm: 168,
        weightKg: 56.2,
        primaryGoal: 'weight_management',
        goals: ['weight_management', 'sleep'],
      },
    });
  });

  it('keeps the empty state explicit when neither source has a profile', async () => {
    const result = await loadProfileForDisplay(
      async () => Promise.reject(new Error('offline')),
      () => null,
    );

    expect(result).toEqual({ source: 'unavailable', profile: null });
  });
});
