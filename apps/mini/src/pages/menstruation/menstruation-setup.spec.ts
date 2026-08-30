import { describe, expect, it } from 'vitest';
import { validateCycleSetup } from './menstruation-setup.js';

describe('validateCycleSetup', () => {
  it('requires valid ranges and a start date', () => {
    expect(validateCycleSetup({ cycleLength: '', periodLength: '', lastPeriodStart: '' })).toEqual({ cycleLength: '请输入 20～45 天', periodLength: '请输入 2～10 天', lastPeriodStart: '请选择最近一次开始日期' });
  });
  it('accepts a valid setup and rejects reversed dates', () => {
    expect(validateCycleSetup({ cycleLength: '28', periodLength: '5', lastPeriodStart: '2026-08-10', lastPeriodEnd: '2026-08-09' })).toEqual({ lastPeriodEnd: '结束日期不能早于开始日期' });
  });
});
