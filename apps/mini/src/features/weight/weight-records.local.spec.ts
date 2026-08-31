import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createLocalWeightRecord,
  deleteLocalWeightRecord,
  listLocalWeightRecords,
  updateLocalWeightRecord,
} from './weight-records.local.js';

const storage = new Map<string, unknown>();
vi.stubGlobal('uni', {
  getStorageSync: (key: string) => storage.get(key),
  setStorageSync: (key: string, value: unknown) => storage.set(key, value),
});

describe('local weight records', () => {
  beforeEach(() => storage.clear());

  it('merges legacy and health records without duplicate ids', () => {
    storage.set('heban-weight-records', [
      { id: 'w1', weight: 65.2, recordedAt: '2026-08-30T08:00:00.000Z' },
    ]);
    storage.set('heban.health.records.v1', [
      { id: 'w1', type: 'weight', valueKg: 65.2, recordedAt: '2026-08-30T08:00:00.000Z' },
      { id: 'a1', type: 'activity', durationMinutes: 20, recordedAt: '2026-08-30T09:00:00.000Z' },
    ]);

    expect(listLocalWeightRecords()).toHaveLength(1);
  });

  it('creates, updates and deletes the same record in both local stores', () => {
    const created = createLocalWeightRecord({
      weight: 64.8,
      recordedAt: '2026-08-31T08:00:00.000Z',
      note: '晨起空腹',
    });
    updateLocalWeightRecord(created.id, {
      weight: 64.5,
      recordedAt: created.recordedAt,
      note: '修改后',
    });

    expect(listLocalWeightRecords()[0]).toMatchObject({ weight: 64.5, note: '修改后' });
    expect(storage.get('heban.health.records.v1')).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: created.id, valueKg: 64.5 })]),
    );

    deleteLocalWeightRecord(created.id);
    expect(listLocalWeightRecords()).toEqual([]);
  });
});
