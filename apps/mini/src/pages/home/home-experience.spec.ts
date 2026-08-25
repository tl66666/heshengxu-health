import { describe, expect, it } from 'vitest';
import { planPresentation } from '../../features/health-loop/plan-presentation.js';

describe('daily action loop page contracts', () => {
  it('shows completion art only for a real non-empty completed plan', () => {
    expect(planPresentation([{ status: 'completed' }]).showCompleteArt).toBe(true);
    expect(planPresentation([]).showCompleteArt).toBe(false);
  });
});
