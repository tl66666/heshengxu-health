import { describe, expect, it } from 'vitest';
import { calculateBmi, classifyBmi } from './bmi.js';

describe('BMI', () => {
  it('rounds BMI to one decimal place', () => {
    expect(calculateBmi(168, 62)).toBe(22);
  });

  it.each([
    [17.9, 'underweight'],
    [22, 'normal'],
    [25.4, 'overweight'],
    [29, 'obesity'],
  ] as const)('classifies %s as %s', (value, category) => {
    expect(classifyBmi(value)).toBe(category);
  });
});
