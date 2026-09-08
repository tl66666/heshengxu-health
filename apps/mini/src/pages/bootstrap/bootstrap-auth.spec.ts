import { describe, expect, it } from 'vitest';
import bootstrapSource from './BootstrapPage.vue?raw';

describe('bootstrap authentication gate', () => {
  it('requires an App session before reading local profile or entering onboarding', () => {
    expect(bootstrapSource).toContain('isSignedIn()');
    expect(bootstrapSource).toContain('resolveAuthEntry');
    expect(bootstrapSource).toContain('currentUniPlatform()');
  });

  it('checks authentication before using cached profile data', () => {
    expect(bootstrapSource.indexOf('ensureAppSession')).toBeGreaterThan(-1);
    expect(bootstrapSource.indexOf('const localProfile')).toBeGreaterThan(
      bootstrapSource.indexOf('ensureAppSession'),
    );
  });

  it('warms critical artwork before entering the product', () => {
    expect(bootstrapSource).toContain('preloadCriticalAssets');
    expect(bootstrapSource.indexOf('await preloadCriticalAssets()')).toBeLessThan(
      bootstrapSource.indexOf('const client = createMiniApiClient()'),
    );
  });

  it('sends signed-out WeChat users to the explicit authorization page before profile reads', () => {
    expect(bootstrapSource).toContain('const authEntry = resolveAuthEntry');
    expect(bootstrapSource.indexOf('const authEntry = resolveAuthEntry')).toBeLessThan(
      bootstrapSource.indexOf('const client = createMiniApiClient()'),
    );
    expect(bootstrapSource).not.toContain('promptWechatLoginRetry()');
  });
});
