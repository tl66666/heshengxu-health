import { describe, expect, it } from 'vitest';
import { HealthProfileService } from './health-profile.service.js';

describe('HealthProfileService', () => {
  it('uses the authenticated user id as the only lookup key', async () => {
    const repository = {
      findOrCreateForUser: async (userId: string) => ({
        userId,
        birthDate: null,
        sex: 'unspecified' as const,
        heightCm: 168,
        weightKg: 62,
      }),
      updateForUser: async () => ({
        userId: 'user-a',
        birthDate: null,
        sex: 'unspecified' as const,
        heightCm: 168,
        weightKg: 62,
      }),
    };
    const service = new HealthProfileService(repository);

    await expect(service.getForUser('user-a')).resolves.toMatchObject({ userId: 'user-a' });
  });
});
