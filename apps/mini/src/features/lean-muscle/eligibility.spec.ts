import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveUnderageProfile } from './eligibility.js';
describe('lean muscle profile eligibility', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('resolves a minor from the remote profile when local profile is absent', async () => {
    vi.stubGlobal('uni', {
      getStorageSync: () => '',
      request: ({ success }: { success: (r: unknown) => void }) =>
        success({ statusCode: 200, data: { data: { birthDate: '2020-01-01', sex: 'male' } } }),
    });
    expect(await resolveUnderageProfile()).toBe(true);
  });
  it('discards remote eligibility from an account that has changed', async () => {
    let account = 'a';
    let respond: ((r: unknown) => void) | undefined;
    vi.stubGlobal('uni', {
      getStorageSync: (key: string) => (key === 'heban.auth.user-id' ? account : ''),
      request: ({ success }: { success: (r: unknown) => void }) => {
        respond = success;
      },
    });
    const result = resolveUnderageProfile();
    account = 'b';
    respond!({ statusCode: 200, data: { data: { birthDate: '1990-01-01' } } });
    expect(await result).toBeNull();
  });
});
