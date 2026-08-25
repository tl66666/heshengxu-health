import { describe, expect, it } from 'vitest';
import { planPresentation } from './plan-presentation.js';

describe('planPresentation', () => {
  it('shows completion art only when every real task is complete', () => {
    expect(
      planPresentation([{ status: 'completed' }, { status: 'completed' }]).showCompleteArt,
    ).toBe(true);
    expect(planPresentation([{ status: 'completed' }, { status: 'pending' }]).showCompleteArt).toBe(
      false,
    );
  });

  it('does not celebrate an empty plan', () => {
    expect(planPresentation([]).showCompleteArt).toBe(false);
  });
});
