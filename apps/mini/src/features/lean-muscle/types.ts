export type LeanPlan = {
  direction: 'strength' | 'recompose' | 'maintain';
  location: 'home' | 'gym';
  experience: 'beginner' | 'experienced';
  trainingDays: number[];
  durationMinutes: number;
  proteinG: number | null;
  sleepMinutes: number;
  representativeId: string;
  representativeReps: number;
  representativeLoadKg: number;
};
export type TrainingSet = { reps: number; loadKg: number };
export type Session = {
  id: string;
  date: string;
  durationMinutes: number;
  exercises: { exerciseId: string; sets: TrainingSet[] }[];
  note: string;
  recordedAt: string;
};
export type DailyEvidence = {
  activity?: 'rest' | 'missed';
  recovered?: boolean;
  foodComplete?: boolean;
  foodFingerprint?: string;
  balancedMeals?: number;
  mainMeals?: number;
};
export type Journal = {
  version: 1;
  plans: Record<string, LeanPlan>;
  sessions: Session[];
  evidence: Record<string, DailyEvidence>;
  reviews: Record<string, { observation: string; action: string }>;
  pausedWeeks: string[];
  bookmarks: string[];
  readingId: string | null;
};
export type DaySignal = {
  proteinG?: number;
  energyKcal?: number;
  foodFingerprint?: string;
  foodValid?: boolean;
  foodError?: boolean;
  sleepMinutes?: number;
  mealCount?: number;
};
export type WeekSignals = Record<string, DaySignal>;
export type ScoreDimension = {
  id: string;
  title: string;
  weight: number;
  points: number;
  upper: number;
  coverage: number;
  detail: string;
  formula: string;
};
