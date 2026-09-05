import { afterEach, describe, expect, it, vi } from 'vitest';
import { isSignedIn } from './auth-store.js';

describe('auth session state', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('does not treat a malformed persisted token as a signed-in session', () => {
    vi.stubGlobal('uni', { getStorageSync: () => 'stale-token' });
    expect(isSignedIn()).toBe(false);
  });

  it('accepts an unexpired access token issued by the API', () => {
    const payload = btoa(JSON.stringify({ typ: 'access', exp: Date.now() + 60_000 }));
    vi.stubGlobal('uni', { getStorageSync: () => `${payload}.signature` });
    expect(isSignedIn()).toBe(true);
  });
});
