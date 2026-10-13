import { describe, expect, it } from 'vitest';
import { weightChangeMilestone } from './weight-milestones.js';
describe('weight milestone evidence', () => {
  it('does not celebrate a missing current record as a large weight decrease', () => {
    expect(
      weightChangeMilestone({ start: 70, current: 0, direction: 'lose', hasGoal: false }),
    ).toEqual({ title: '记录变化', note: '待记录', achieved: false });
    expect(
      weightChangeMilestone({ start: 70, current: 0, direction: 'lose', hasGoal: true }).achieved,
    ).toBe(false);
  });
  it('requires a real goal before treating a change as an achievement', () => {
    expect(
      weightChangeMilestone({ start: 70, current: 68, direction: 'lose', hasGoal: false }),
    ).toEqual({ title: '记录变化', note: '较初始 -2.0 kg', achieved: false });
  });
  it('recognizes changes only in the actual target direction', () => {
    expect(
      weightChangeMilestone({ start: 70, current: 71, direction: 'gain', hasGoal: true }).achieved,
    ).toBe(true);
    expect(
      weightChangeMilestone({ start: 70, current: 71, direction: 'lose', hasGoal: true }).achieved,
    ).toBe(false);
  });
  it('does not reward drift when the direction is maintenance', () => {
    expect(
      weightChangeMilestone({ start: 70, current: 72, direction: 'maintain', hasGoal: true })
        .achieved,
    ).toBe(false);
  });
});
