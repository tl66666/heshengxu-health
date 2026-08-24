export type HealthProfile = {
  userId: string;
  displayName?: string | null;
  birthDate: Date | null;
  sex: 'female' | 'male' | 'unspecified';
  heightCm: number | null;
  weightKg: number | null;
  primaryGoal?: HealthGoal | null;
};

export type HealthGoal =
  | 'weight_management'
  | 'weight_maintenance'
  | 'muscle_gain'
  | 'sleep'
  | 'energy'
  | 'mood';

export type HealthProfileUpdate = Pick<
  HealthProfile,
  'displayName' | 'birthDate' | 'sex' | 'heightCm' | 'weightKg' | 'primaryGoal'
>;

export interface HealthProfileRepository {
  findOrCreateForUser(userId: string): Promise<HealthProfile>;
  updateForUser?(userId: string, update: HealthProfileUpdate): Promise<HealthProfile>;
}

export class InMemoryHealthProfileRepository implements HealthProfileRepository {
  private readonly profiles = new Map<string, HealthProfile>();

  async findOrCreateForUser(userId: string): Promise<HealthProfile> {
    const profile = this.profiles.get(userId) ?? {
      userId,
      displayName: null,
      birthDate: null,
      sex: 'unspecified' as const,
      heightCm: null,
      weightKg: null,
      primaryGoal: null,
    };
    this.profiles.set(userId, profile);
    return profile;
  }

  async updateForUser(userId: string, update: HealthProfileUpdate): Promise<HealthProfile> {
    const current = await this.findOrCreateForUser(userId);
    const next = { ...current, ...update };
    this.profiles.set(userId, next);
    return next;
  }
}
