import { describe, expect, it } from 'vitest';
import { localProfileFromEdit } from './profile-save.js';

describe('localProfileFromEdit', () => {
  it('creates a complete local fallback only when body and goal data are present', () => {
    expect(
      localProfileFromEdit({
        displayName: '小禾',
        heightCm: '168',
        weightKg: '56.2',
        primaryGoal: 'weight_management',
      }),
    ).toEqual({
      displayName: '小禾',
      heightCm: 168,
      weightKg: 56.2,
      primaryGoal: 'weight_management',
    });
  });

  it('refuses a partial profile because it cannot truthfully replace the local archive', () => {
    expect(
      localProfileFromEdit({
        displayName: '小禾',
        heightCm: '',
        weightKg: '56.2',
        primaryGoal: 'weight_management',
      }),
    ).toBeNull();
  });
});
