import type { HealthProfileRepository } from './health-profile.repository.js';

export class HealthProfileService {
  constructor(private readonly repository: HealthProfileRepository) {}

  getForUser(userId: string) {
    return this.repository.findOrCreateForUser(userId);
  }
}
