import { describe, expect, it } from 'vitest';
import { loadProfileForDisplay } from './profile-loader.js';

describe('loadProfileForDisplay', () => {
  it('uses the local onboarding profile when the API is unavailable', async () => {
    const result = await loadProfileForDisplay(
      async () => Promise.reject(new Error('offline')),
      () => ({
        displayName: '小禾',
        heightCm: 168,
        weightKg: 56.2,
        primaryGoal: 'weight_management',
      }),
    );

    expect(result).toEqual({
      source: 'local',
      profile: {
        userId: 'local-preview',
        displayName: '小禾',
        birthDate: null,
        sex: 'unspecified',
        heightCm: 168,
        weightKg: 56.2,
        primaryGoal: 'weight_management',
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
