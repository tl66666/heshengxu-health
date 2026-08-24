export type BmiCategory = 'underweight' | 'normal' | 'overweight' | 'obesity';

export function calculateBmi(heightCm: number, weightKg: number): number {
  if (heightCm <= 0 || weightKg <= 0) return 0;
  return Math.round((weightKg / (heightCm / 100) ** 2) * 10) / 10;
}

export function classifyBmi(bmi: number): BmiCategory {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 24) return 'normal';
  if (bmi < 28) return 'overweight';
  return 'obesity';
}
