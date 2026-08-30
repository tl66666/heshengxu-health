export type PainLevel = 'none' | 'mild' | 'moderate' | 'severe';

export type CycleSettings = {
  cycleLength: number;
  periodLength: number;
  lastPeriodStart: string;
  lastPeriodEnd?: string;
  updatedAt: string;
};

export type PeriodDayRecord = {
  date: string;
  isPeriod: boolean;
  pain?: PainLevel;
  symptoms: string[];
  note?: string;
};
