import { describe, expect, it } from 'vitest';
import { goalLabels, sexLabels } from './health-profile.types.js';

describe('health profile labels', () => {
  it('provides readable labels for every supported goal and sex', () => {
    expect(Object.keys(goalLabels)).toHaveLength(6);
    expect(sexLabels.unspecified).toBe('暂不说明');
  });
});
