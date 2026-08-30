export type CycleSetupInput = { cycleLength: string; periodLength: string; lastPeriodStart: string; lastPeriodEnd?: string };
export type CycleSetupErrors = Partial<Record<'cycleLength' | 'periodLength' | 'lastPeriodStart' | 'lastPeriodEnd', string>>;

export function validateCycleSetup(input: CycleSetupInput): CycleSetupErrors {
  const errors: CycleSetupErrors = {};
  const cycle = Number(input.cycleLength);
  const period = Number(input.periodLength);
  if (!Number.isInteger(cycle) || cycle < 20 || cycle > 45) errors.cycleLength = '请输入 20～45 天';
  if (!Number.isInteger(period) || period < 2 || period > 10) errors.periodLength = '请输入 2～10 天';
  if (!input.lastPeriodStart) errors.lastPeriodStart = '请选择最近一次开始日期';
  if (input.lastPeriodStart && input.lastPeriodEnd && input.lastPeriodEnd < input.lastPeriodStart) errors.lastPeriodEnd = '结束日期不能早于开始日期';
  return errors;
}
