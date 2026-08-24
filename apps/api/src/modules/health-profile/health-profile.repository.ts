export type HealthProfile = {
  userId: string;
  birthDate: Date | null;
  sex: 'female' | 'male' | 'unspecified';
  heightCm: number | null;
  weightKg: number | null;
};

export interface HealthProfileRepository {
  findOrCreateForUser(userId: string): Promise<HealthProfile>;
}

export class InMemoryHealthProfileRepository implements HealthProfileRepository {
  private readonly profiles = new Map<string, HealthProfile>();

  async findOrCreateForUser(userId: string): Promise<HealthProfile> {
    const profile = this.profiles.get(userId) ?? {
      userId,
      birthDate: null,
      sex: 'unspecified' as const,
      heightCm: null,
      weightKg: null,
    };
    this.profiles.set(userId, profile);
    return profile;
  }
}
