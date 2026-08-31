import { describe, expect, it } from 'vitest';
import { localProfileFromEdit } from './profile-save.js';

describe('localProfileFromEdit', () => {
  it('creates a complete local fallback only when body and goal data are present', () => {
    expect(
      localProfileFromEdit({
        displayName: '小禾',
        sex: 'female',
        birthDate: '1998-05-20',
        heightCm: '168',
        weightKg: '56.2',
        primaryGoal: 'weight_management',
        goals: ['weight_management', 'sleep'],
      }),
    ).toEqual({
      displayName: '小禾',
      sex: 'female',
      birthDate: '1998-05-20',
      heightCm: 168,
      weightKg: 56.2,
      primaryGoal: 'weight_management',
      goals: ['weight_management', 'sleep'],
    });
  });

  it('refuses a partial profile because it cannot truthfully replace the local archive', () => {
    expect(
      localProfileFromEdit({
        displayName: '小禾',
        sex: 'female',
        birthDate: '1998-05-20',
        heightCm: '',
        weightKg: '56.2',
        primaryGoal: 'weight_management',
        goals: ['weight_management'],
      }),
    ).toBeNull();
  });
});
