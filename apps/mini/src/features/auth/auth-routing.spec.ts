import { describe, expect, it } from 'vitest';
import { resolveAuthEntry } from './auth-routing.js';

describe('platform authentication entry', () => {
  it('sends a signed-out App runtime to the password account page', () => {
    expect(resolveAuthEntry({ platform: 'app-plus', signedIn: false })).toBe(
      '/pages/auth/AppAuthPage',
    );
  });

  it('sends a signed-out WeChat mini program to the WeChat authorization page', () => {
    expect(resolveAuthEntry({ platform: 'mp-weixin', signedIn: false })).toBe(
      '/pages/auth/WechatAuthPage',
    );
  });

  it('continues to profile resolution only after either runtime is signed in', () => {
    expect(resolveAuthEntry({ platform: 'app', signedIn: true })).toBeNull();
    expect(resolveAuthEntry({ platform: 'mp-weixin', signedIn: true })).toBeNull();
  });

  it('does not show a native authentication page on unsupported preview runtimes', () => {
    expect(resolveAuthEntry({ platform: 'h5', signedIn: false })).toBeNull();
  });
});
