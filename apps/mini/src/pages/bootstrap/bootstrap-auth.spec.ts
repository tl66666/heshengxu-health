import { describe, expect, it } from 'vitest';
import bootstrapSource from './BootstrapPage.vue?raw';

describe('bootstrap authentication gate', () => {
  it('requires an App session before reading local profile or entering onboarding', () => {
    expect(bootstrapSource).toContain('isAppRuntime()');
    expect(bootstrapSource).toContain('isSignedIn()');
    expect(bootstrapSource).toContain("/pages/auth/AppAuthPage");
  });

  it('checks authentication before using cached profile data', () => {
    expect(bootstrapSource.indexOf('ensureAppSession')).toBeGreaterThan(-1);
    expect(bootstrapSource.indexOf('const localProfile')).toBeGreaterThan(
      bootstrapSource.indexOf('ensureAppSession'),
    );
  });
});
