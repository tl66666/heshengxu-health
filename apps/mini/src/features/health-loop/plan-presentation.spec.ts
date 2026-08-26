import { describe, expect, it } from 'vitest';
import { planPageState, planPresentation } from './plan-presentation.js';

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

  it('keeps loading failure distinct from an empty plan', () => {
    expect(planPageState(null, '', true)).toBe('loading');
    expect(planPageState(null, '服务暂不可用')).toBe('error');
    expect(planPageState(null, '')).toBe('empty');
    expect(planPageState({ id: 'plan-1' }, '')).toBe('active');
  });
});
