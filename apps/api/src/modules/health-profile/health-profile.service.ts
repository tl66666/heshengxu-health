import type { HealthProfileRepository } from './health-profile.repository.js';
import { calculateBmi, classifyBmi } from '@heban/domain';
import type { HealthProfileUpdate } from './health-profile.repository.js';

export class HealthProfileService {
  constructor(private readonly repository: HealthProfileRepository) {}

  async getForUser(userId: string) {
    return this.withDerivedMetrics(await this.repository.findOrCreateForUser(userId));
  }

  async updateForUser(userId: string, update: HealthProfileUpdate) {
    const profile = await this.repository.updateForUser(userId, update);
    return this.withDerivedMetrics(profile);
  }

  private withDerivedMetrics(
    profile: Awaited<ReturnType<HealthProfileRepository['findOrCreateForUser']>>,
  ) {
    const bmi =
      profile.heightCm && profile.weightKg
        ? calculateBmi(profile.heightCm, profile.weightKg)
        : null;
    return {
      ...profile,
      bmi,
      bmiCategory: bmi === null ? null : classifyBmi(bmi),
    };
  }
}
