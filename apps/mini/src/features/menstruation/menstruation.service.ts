import type { CycleSettings, PeriodDayRecord } from './menstruation.types.js';

const CYCLE_KEY = 'heban_menstruation_cycle';
const DAYS_KEY = 'heban_menstruation_daily';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = uni.getStorageSync(key) as T | string | null;
    if (!raw) return fallback;
    return (typeof raw === 'string' ? JSON.parse(raw) : raw) as T;
  } catch {
    return fallback;
  }
}

function validDate(value: unknown) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function loadCycleSettings(): CycleSettings | null {
  const value = read<Partial<CycleSettings> | null>(CYCLE_KEY, null);
  if (!value || !validDate(value.lastPeriodStart)) return null;
  const cycleLength = Number(value.cycleLength);
  const periodLength = Number(value.periodLength);
  if (cycleLength < 20 || cycleLength > 45 || periodLength < 2 || periodLength > 10) return null;
  return {
    cycleLength,
    periodLength,
    lastPeriodStart: value.lastPeriodStart,
    lastPeriodEnd: validDate(value.lastPeriodEnd) ? value.lastPeriodEnd : undefined,
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : new Date().toISOString(),
  };
}

export function saveCycleSettings(settings: CycleSettings) {
  uni.setStorageSync(CYCLE_KEY, JSON.stringify(settings));
}

export function loadPeriodDay(date: string): PeriodDayRecord | null {
  const records = read<Record<string, PeriodDayRecord>>(DAYS_KEY, {});
  return records[date] || null;
}

export function savePeriodDay(record: PeriodDayRecord) {
  const records = read<Record<string, PeriodDayRecord>>(DAYS_KEY, {});
  records[record.date] = { ...record, symptoms: [...record.symptoms] };
  uni.setStorageSync(DAYS_KEY, JSON.stringify(records));
}

export function listPeriodDays(): PeriodDayRecord[] {
  const records = read<Record<string, PeriodDayRecord>>(DAYS_KEY, {});
  return Object.values(records).filter((record) => validDate(record.date));
}

export function clearCycleSettings() {
  uni.removeStorageSync(CYCLE_KEY);
  uni.removeStorageSync(DAYS_KEY);
}
