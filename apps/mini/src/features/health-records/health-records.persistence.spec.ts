import { afterEach, describe, expect, it, vi } from 'vitest';
import { createHealthRecordsStore } from './health-records.store.js';
describe('real local record save failures', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('keeps the form unsaved when device storage rejects a health record', async () => {
    vi.stubGlobal('uni', {
      getStorageSync: () => undefined,
      setStorageSync: () => {
        throw new Error('storage full');
      },
    });
    const store = createHealthRecordsStore();
    const result = await store.save(
      { type: 'weight', valueKg: '70', note: '测试记录' },
      '2026-10-13',
      null,
    );
    expect(result.persisted).toBe(false);
    expect(store.saveError.value).toBe('storage full');
    expect(store.saving.value).toBe(false);
  });
});
