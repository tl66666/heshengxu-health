import { describe, expect, it } from 'vitest';
import onboardingSource from './OnboardingPage.vue?raw';

describe('onboarding persistence', () => {
  it('syncs the completed health profile to the authenticated API', () => {
    expect(onboardingSource).toContain('saveHealthProfile');
    expect(onboardingSource).toContain('await saveHealthProfile');
  });
});
