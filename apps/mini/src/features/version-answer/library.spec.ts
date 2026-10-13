import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { findGuides, getGuide, topics } from './content.js';
import { loadLibrary, bookmarkGuide, addGuideAction, toggleGuideAction } from './store.js';
describe('version answer library', () => {
  const storage = new Map<string, unknown>();
  beforeEach(() => {
    storage.clear();
    vi.stubGlobal('uni', {
      getStorageSync: (key: string) => storage.get(key),
      setStorageSync: (key: string, value: unknown) => storage.set(key, structuredClone(value)),
    });
  });
  afterEach(() => vi.unstubAllGlobals());
  it('has five topics and filters by topic and search text together', () => {
    expect(topics.map((t) => t.id)).toEqual(['muscle', 'sun', 'water', 'codex', 'life']);
    expect(findGuides({ topic: 'codex', query: '验证' }).length).toBeGreaterThan(0);
    expect(findGuides({ topic: 'water', query: 'Codex' })).toEqual([]);
  });
  it('isolates bookmarks and refuses unknown guide ids', () => {
    storage.set('heban.auth.user-id', 'a');
    const guide = findGuides({ topic: 'sun' })[0]!;
    bookmarkGuide(guide.id, true);
    expect(findGuides({ saved: loadLibrary().bookmarks })).toHaveLength(1);
    storage.set('heban.auth.user-id', 'b');
    expect(loadLibrary().bookmarks).toEqual([]);
    expect(() => bookmarkGuide('missing', true)).toThrow();
    expect(getGuide('missing')).toBeNull();
  });
  it('adds a guide action once and persists manual completion', () => {
    const guide = findGuides({ topic: 'life' })[0]!;
    addGuideAction(guide.id);
    addGuideAction(guide.id);
    expect(loadLibrary().actions).toHaveLength(1);
    toggleGuideAction(guide.id);
    expect(loadLibrary().actions[0]!.done).toBe(true);
  });
  it('propagates write failures instead of pretending that an action was saved', () => {
    vi.stubGlobal('uni', {
      getStorageSync: () => '',
      setStorageSync: () => {
        throw new Error('full');
      },
    });
    expect(() => addGuideAction(findGuides({})[0]!.id)).toThrow();
  });
});
