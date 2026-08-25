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
  updateForUser(userId: string, update: HealthProfileUpdate): Promise<HealthProfile>;
}
