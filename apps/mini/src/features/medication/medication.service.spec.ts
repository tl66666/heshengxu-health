import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadCheckinsForDate, loadMedicationReminders, saveMedicationReminder, setMedicationCheckin } from './medication.service.js';

const storage = new Map<string, unknown>();
vi.stubGlobal('uni', { getStorageSync: (key: string) => storage.get(key), setStorageSync: (key: string, value: unknown) => storage.set(key, value) });

describe('medication service', () => {
  beforeEach(() => storage.clear());
  it('keeps empty state empty without seeded reminders', () => expect(loadMedicationReminders()).toEqual([]));
  it('scopes check-ins to their date', () => {
    saveMedicationReminder({ id: 'm1', name: '用户填写的药物', doseNote: '按医嘱', frequency: 'daily', active: true, createdAt: '2026-08-30T00:00:00.000Z' });
    setMedicationCheckin('m1', '2026-08-30', true);
    expect(loadCheckinsForDate('2026-08-30')).toHaveLength(1);
    expect(loadCheckinsForDate('2026-08-31')).toHaveLength(0);
  });
});
