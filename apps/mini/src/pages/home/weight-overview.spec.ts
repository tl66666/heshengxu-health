import { describe, expect, it } from 'vitest';
import { weightOverview } from './weight-overview.js';

describe('home weight arc data states', () => {
  it('keeps a visible empty arc without inventing progress or a current weight', () => {
    expect(weightOverview({})).toMatchObject({
      value: '--',
      label: '当前体重 · kg',
      progress: 0,
      showNode: false,
      hasTarget: false,
    });
  });
  it('shows the real current weight without requiring a weight goal', () => {
    expect(weightOverview({ current: 70.3 })).toMatchObject({
      value: '70.3',
      progress: 0,
      showNode: false,
    });
  });
  it('keeps missing goal evidence unknown rather than showing zero achieved', () => {
    expect(weightOverview({ start: 70, target: 65, direction: 'lose' })).toMatchObject({
      value: '--',
      progress: 0,
      showNode: false,
    });
  });
  it('uses gain direction and bounds the arc without rewarding reverse change', () => {
    expect(weightOverview({ start: 60, current: 61, target: 65, direction: 'gain' })).toMatchObject(
      { value: '1.0', label: '已增加 · kg', progress: 20, showNode: true },
    );
    expect(weightOverview({ start: 60, current: 58, target: 65, direction: 'gain' })).toMatchObject(
      { value: '0.0', progress: 0 },
    );
    expect(weightOverview({ start: 60, current: 70, target: 65, direction: 'gain' }).progress).toBe(
      100,
    );
  });
  it('shows maintenance as current weight instead of a fabricated weight loss', () => {
    expect(
      weightOverview({ start: 60, current: 60.5, target: 60, direction: 'maintain' }),
    ).toMatchObject({ value: '60.5', label: '当前体重 · kg', showNode: false });
  });
});
