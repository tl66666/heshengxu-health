import { describe, expect, it } from 'vitest';
import { planSetupFields } from './plan-setup-flow.js';

describe('plan setup fields', () => {
  it('shows weight direction and target only for the weight plan', () => {
    expect(planSetupFields('weight')).toEqual({ showDirection: true, showTargetWeight: true });
    expect(planSetupFields('sleep')).toEqual({ showDirection: false, showTargetWeight: false });
  });
});
