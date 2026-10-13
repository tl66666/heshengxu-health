import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  defaultHomeCardVisibility,
  loadHomeCardVisibility,
  saveHomeCardVisibility,
  resetHomeCardVisibility,
} from './home-card-settings.js';

describe('home card settings', () => {
  const storage = new Map<string, unknown>();
  beforeEach(() => {
    storage.clear();
    vi.stubGlobal('uni', {
      getStorageSync: (key: string) => storage.get(key),
      setStorageSync: (key: string, value: unknown) => storage.set(key, value),
    });
  });
  afterEach(() => vi.unstubAllGlobals());
  it('replaces period with lean muscle for men', () => {
    expect(defaultHomeCardVisibility('male').period).toBe(false);
    expect(defaultHomeCardVisibility('male')['version-answer']).toBe(true);
  });
  it('preserves period for women and keeps unspecified profiles neutral', () => {
    expect(defaultHomeCardVisibility('female').period).toBe(true);
    expect(defaultHomeCardVisibility('female')['version-answer']).toBe(true);
    expect(defaultHomeCardVisibility('unspecified').period).toBe(false);
    expect(defaultHomeCardVisibility().period).toBe(false);
  });
  it('preserves explicit preferences across profile changes and isolates accounts', () => {
    storage.set('heban.auth.user-id', 'a');
    saveHomeCardVisibility(
      { ...defaultHomeCardVisibility('male'), 'version-answer': false },
      'version-answer',
    );
    expect(loadHomeCardVisibility('female')['version-answer']).toBe(false);
    expect(loadHomeCardVisibility('female').period).toBe(true);
    storage.set('heban.auth.user-id', 'b');
    expect(loadHomeCardVisibility('male')['version-answer']).toBe(true);
    storage.set('heban.auth.user-id', 'a');
    expect(resetHomeCardVisibility('male')['version-answer']).toBe(true);
  });
  it('does not apply unowned legacy preferences to authenticated users', () => {
    storage.set('heban_home_card_visibility', JSON.stringify({ period: true }));
    storage.set('heban.auth.user-id', 'a');
    expect(loadHomeCardVisibility('male').period).toBe(false);
  });
  it('migrates the old lean muscle card preference without inventing a new toggle', () => {
    storage.set('heban.home-card-preferences.v2', JSON.stringify({ 'lean-muscle': false }));
    expect(loadHomeCardVisibility('male')['version-answer']).toBe(false);
  });
});
