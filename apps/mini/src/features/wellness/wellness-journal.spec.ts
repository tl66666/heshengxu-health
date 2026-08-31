import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadWellnessJournal, saveMood, saveSleep } from './wellness-journal.js';

const storage = new Map<string, unknown>();
vi.stubGlobal('uni', { getStorageSync: (key: string) => storage.get(key), setStorageSync: (key: string, value: unknown) => storage.set(key, value) });

describe('wellness journal', () => {
  beforeEach(() => storage.clear());
  it('persists a real mood entry for the selected day', () => {
    const saved = saveMood({ tone: 'bright', note: '和朋友散步' }, '2026-08-31');
    expect(saved.date).toBe('2026-08-31');
    expect(loadWellnessJournal('2026-08-31').mood?.note).toBe('和朋友散步');
  });
  it('persists sleep duration, quality and dream note', () => {
    saveSleep({ durationMinutes: 420, quality: 'good', dream: '在花园里吃早餐' }, '2026-08-31');
    expect(loadWellnessJournal('2026-08-31').sleep).toMatchObject({ durationMinutes: 420, quality: 'good', dream: '在花园里吃早餐' });
  });
});
