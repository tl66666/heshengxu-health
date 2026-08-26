import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./health-records.service.js', () => ({
  createHealthRecord: vi.fn(),
  loadTodayRecords: vi.fn(),
  replaceHealthRecord: vi.fn(),
}));

import { createHealthRecord, loadTodayRecords } from './health-records.service.js';
import { createHealthRecordsStore } from './health-records.store.js';

describe('health records store errors', () => {
  beforeEach(() => vi.resetAllMocks());

  it('keeps a failed save separate from loading state so the form can remain visible', async () => {
    vi.mocked(createHealthRecord).mockRejectedValueOnce(new Error('network unavailable'));
    const store = createHealthRecordsStore();

    const result = await store.save(
      { type: 'weight', valueKg: '61.8', note: '' },
      '2026-08-26',
      null,
    );

    expect(result).toEqual({ fieldErrors: {}, persisted: false });
    expect(store.saveError.value).toBe('network unavailable');
    expect(store.loadError.value).toBe('');
  });

  it('uses loadError only when the record timeline cannot be loaded', async () => {
    vi.mocked(loadTodayRecords).mockRejectedValueOnce(new Error('timeline unavailable'));
    const store = createHealthRecordsStore();

    await store.load('2026-08-26');

    expect(store.loadError.value).toBe('timeline unavailable');
    expect(store.saveError.value).toBe('');
  });
});
