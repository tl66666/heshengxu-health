import { afterEach, describe, expect, it, vi } from 'vitest';
import { returnToLibrary, consumeLibraryDestination } from './navigation.js';
describe('library page reuse', () => {
  afterEach(() => {
    consumeLibraryDestination();
    vi.unstubAllGlobals();
  });
  it('returns to the first existing library instead of growing the page stack', () => {
    const back = vi.fn();
    const redirect = vi.fn();
    vi.stubGlobal('uni', { getStorageSync: () => '', navigateBack: back, redirectTo: redirect });
    vi.stubGlobal('getCurrentPages', () => [
      { route: 'pages/home/HomePage' },
      { route: 'pages/version-answer/VersionAnswerPage' },
      { route: 'pages/version-answer/GuidePage' },
      { route: 'pages/version-answer/VersionAnswerPage' },
      { route: 'pages/version-answer/GuidePage' },
    ]);
    returnToLibrary({ tab: 'actions', focus: 'codex-start' });
    expect(back.mock.calls[0]?.[0].delta).toBe(3);
    expect(redirect).not.toHaveBeenCalled();
    expect(consumeLibraryDestination()).toEqual({ tab: 'actions', focus: 'codex-start' });
    expect(consumeLibraryDestination()).toBeNull();
  });
  it('redirects a deep-linked reader to the requested library destination', () => {
    const redirect = vi.fn();
    vi.stubGlobal('uni', { getStorageSync: () => '', redirectTo: redirect });
    vi.stubGlobal('getCurrentPages', () => [{ route: 'pages/version-answer/GuidePage' }]);
    returnToLibrary({ tab: 'reading', topic: 'codex' });
    expect(redirect.mock.calls[0]?.[0].url).toBe(
      '/pages/version-answer/VersionAnswerPage?tab=reading&topic=codex',
    );
  });
  it('does not apply a pending destination to a different account', () => {
    let account = 'a';
    vi.stubGlobal('uni', { getStorageSync: () => account, navigateBack: vi.fn() });
    vi.stubGlobal('getCurrentPages', () => [
      { route: 'pages/version-answer/VersionAnswerPage' },
      { route: 'pages/version-answer/GuidePage' },
    ]);
    returnToLibrary({ tab: 'actions' });
    account = 'b';
    expect(consumeLibraryDestination()).toBeNull();
  });
});
