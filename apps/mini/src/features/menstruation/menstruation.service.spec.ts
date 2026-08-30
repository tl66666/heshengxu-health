import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadCycleSettings, loadPeriodDay, saveCycleSettings, savePeriodDay } from './menstruation.service.js';

const storage = new Map<string, unknown>();
vi.stubGlobal('uni', { getStorageSync: (key: string) => storage.get(key), setStorageSync: (key: string, value: unknown) => storage.set(key, value), removeStorageSync: (key: string) => storage.delete(key) });

describe('menstruation service', () => {
  beforeEach(() => storage.clear());
  it('keeps missing and invalid settings empty', () => {
    expect(loadCycleSettings()).toBeNull();
    storage.set('heban_menstruation_cycle', JSON.stringify({ cycleLength: 12, periodLength: 5, lastPeriodStart: '2026-08-01' }));
    expect(loadCycleSettings()).toBeNull();
  });
  it('round trips settings and date records', () => {
    saveCycleSettings({ cycleLength: 28, periodLength: 5, lastPeriodStart: '2026-08-01', updatedAt: '2026-08-30T00:00:00.000Z' });
    savePeriodDay({ date: '2026-08-09', isPeriod: true, symptoms: ['腹胀'] });
    expect(loadCycleSettings()?.cycleLength).toBe(28);
    expect(loadPeriodDay('2026-08-09')?.symptoms).toEqual(['腹胀']);
  });
});
