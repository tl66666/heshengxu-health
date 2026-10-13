import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { findGuides, getGuide, topics } from './content.js';
import { actionStepsFor, readingPathFor } from './learning.js';
import {
  loadLibrary,
  addGuideAction,
  markGuideComplete,
  saveActionDetails,
  toggleGuideAction,
  markBibleComplete,
  saveReaderTextSize,
} from './store.js';
import { bibleChapters } from '../lean-muscle/bible.js';

describe('reading and execution progress', () => {
  const storage = new Map<string, unknown>();
  beforeEach(() => {
    storage.clear();
    vi.stubGlobal('uni', {
      getStorageSync: (key: string) => storage.get(key),
      setStorageSync: (key: string, value: unknown) => storage.set(key, structuredClone(value)),
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('offers eight distinct substantial chapters per topic and a complete reading path', () => {
    for (const topic of topics) {
      const guides = findGuides({ topic: topic.id });
      expect(guides).toHaveLength(8);
      expect(new Set(guides.map((g) => g.id)).size).toBe(8);
      expect(readingPathFor(topic.id).map((g) => g.id)).toEqual(guides.map((g) => g.id));
      for (const guide of guides) {
        expect(guide.sections.length).toBeGreaterThanOrEqual(2);
        expect(guide.sources.length).toBeGreaterThan(0);
        expect(actionStepsFor(guide).length).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('keeps old bookmarks and actions when new progress fields are missing', () => {
    storage.set('heban.version-answer.v1', {
      version: 1,
      bookmarks: ['codex-start'],
      readingId: 'codex-start',
      actions: [
        { guideId: 'codex-start', title: 'old action', done: true, createdAt: '2026-10-12' },
      ],
    });
    const state = loadLibrary();
    expect(state.bookmarks).toEqual(['codex-start']);
    expect(state.completedGuideIds).toEqual([]);
    expect(state.actions[0]?.done).toBe(true);
    expect(state.actions[0]?.note).toBe('');
    expect(state.actions[0]?.checkedSteps).toEqual([]);
  });

  it('requires explicit reading completion and keeps it separate from action completion', () => {
    addGuideAction('codex-start');
    markGuideComplete('codex-start', true);
    markGuideComplete('codex-start', true);
    expect(loadLibrary().completedGuideIds).toEqual(['codex-start']);
    expect(loadLibrary().actions[0]?.done).toBe(false);
    toggleGuideAction('codex-start');
    markGuideComplete('codex-start', false);
    expect(loadLibrary().completedGuideIds).toEqual([]);
    expect(loadLibrary().actions[0]?.done).toBe(true);
  });

  it('saves real execution notes, calendar dates and checked steps without duplicated indices', () => {
    addGuideAction('codex-start');
    saveActionDetails('codex-start', {
      dueDate: '2026-10-20',
      note: '完成一页，发现按钮返回有问题。',
      checkedSteps: [0, 0, 1],
    });
    const action = loadLibrary().actions[0]!;
    expect(action.dueDate).toBe('2026-10-20');
    expect(action.note).toContain('返回有问题');
    expect(action.checkedSteps).toEqual([0, 1]);
    expect(action.done).toBe(false);
  });

  it('rejects impossible dates, out-of-range steps and notes that exceed the limit', () => {
    addGuideAction('codex-start');
    expect(() =>
      saveActionDetails('codex-start', { dueDate: '2026-02-30', note: '', checkedSteps: [] }),
    ).toThrow();
    expect(() =>
      saveActionDetails('codex-start', { dueDate: null, note: '', checkedSteps: [999] }),
    ).toThrow();
    expect(() =>
      saveActionDetails('codex-start', { dueDate: null, note: '长'.repeat(501), checkedSteps: [] }),
    ).toThrow();
    expect(() => markGuideComplete('missing', true)).toThrow();
  });

  it('isolates reading and notes across accounts and reports write failures', () => {
    storage.set('heban.auth.user-id', 'reader-a');
    markGuideComplete('codex-start', true);
    addGuideAction('codex-start');
    saveActionDetails('codex-start', { dueDate: null, note: '我的观察', checkedSteps: [0] });
    storage.set('heban.auth.user-id', 'reader-b');
    expect(loadLibrary().completedGuideIds).toEqual([]);
    expect(loadLibrary().actions).toEqual([]);
    vi.stubGlobal('uni', {
      getStorageSync: () => '',
      setStorageSync: () => {
        throw new Error('full');
      },
    });
    expect(() => markGuideComplete('codex-start', true)).toThrow('full');
    expect(getGuide('codex-start')).not.toBeNull();
  });
  it('marks Bible reading separately without changing health records', () => {
    const health = { sessions: [{ id: 'existing-training' }] };
    storage.set('heban.lean-muscle.v1', health);
    markBibleComplete(bibleChapters[0]!.id, true);
    expect(loadLibrary().completedBibleIds).toEqual([bibleChapters[0]!.id]);
    expect(loadLibrary().completedGuideIds).toEqual([]);
    expect(storage.get('heban.lean-muscle.v1')).toEqual(health);
  });
  it('does not mutate persisted action details if the write fails', () => {
    addGuideAction('codex-start');
    const before = structuredClone(storage.get('heban.version-answer.v1'));
    vi.stubGlobal('uni', {
      getStorageSync: (key: string) => storage.get(key),
      setStorageSync: () => {
        throw new Error('full');
      },
    });
    expect(() =>
      saveActionDetails('codex-start', {
        dueDate: null,
        note: '不能假装已保存',
        checkedSteps: [0],
        done: true,
      }),
    ).toThrow('full');
    expect(storage.get('heban.version-answer.v1')).toEqual(before);
  });
  it('remembers text size without marking a page read or an action done', () => {
    saveReaderTextSize(true);
    expect(loadLibrary().largeText).toBe(true);
    expect(loadLibrary().completedGuideIds).toEqual([]);
    expect(loadLibrary().actions).toEqual([]);
  });
});
