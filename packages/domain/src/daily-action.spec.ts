import { describe, expect, it } from 'vitest';
import { selectDailyAction } from './daily-action.js';

describe('selectDailyAction', () => {
  it('asks a user without a plan to set one up', () => {
    expect(
      selectDailyAction({
        planKind: null,
        hasSleepForPreviousNight: false,
        hasWeightToday: false,
        hasMealToday: false,
        hasActivityToday: false,
      }),
    ).toMatchObject({ type: 'setup_plan', route: '/pages/plan-setup/PlanSetupPage' });
  });

  it('asks to record yesterday sleep before other work', () => {
    expect(
      selectDailyAction({
        planKind: 'weight',
        hasSleepForPreviousNight: false,
        hasWeightToday: false,
        hasMealToday: false,
        hasActivityToday: false,
      }),
    ).toMatchObject({ type: 'record_sleep', route: '/pages/records/RecordsPage?type=sleep' });
  });

  it('asks a weight-plan user for weight after sleep exists', () => {
    expect(
      selectDailyAction({
        planKind: 'weight',
        hasSleepForPreviousNight: true,
        hasWeightToday: false,
        hasMealToday: false,
        hasActivityToday: false,
      }),
    ).toMatchObject({ type: 'record_weight' });
  });

  it('skips weight for a sleep plan', () => {
    expect(
      selectDailyAction({
        planKind: 'sleep',
        hasSleepForPreviousNight: true,
        hasWeightToday: false,
        hasMealToday: false,
        hasActivityToday: false,
      }),
    ).toMatchObject({ type: 'record_meal' });
  });

  it('asks for activity after sleep, weight, and meals are present', () => {
    expect(
      selectDailyAction({
        planKind: 'weight',
        hasSleepForPreviousNight: true,
        hasWeightToday: true,
        hasMealToday: true,
        hasActivityToday: false,
      }),
    ).toMatchObject({ type: 'record_activity' });
  });

  it('never invents an action when all four facts exist', () => {
    expect(
      selectDailyAction({
        planKind: 'sleep',
        hasSleepForPreviousNight: true,
        hasWeightToday: true,
        hasMealToday: true,
        hasActivityToday: true,
      }),
    ).toMatchObject({ type: 'review_today' });
  });
});
