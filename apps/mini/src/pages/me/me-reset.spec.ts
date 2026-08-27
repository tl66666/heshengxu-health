import { describe, expect, it } from 'vitest';
import mePageSource from './MePage.vue?raw';
import localDemoSource from '../../features/health-loop/local-demo.js?raw';

describe('demo data reset entry on the me page', () => {
  it('offers an explicit local-only reset guarded by a confirm dialog', () => {
    expect(mePageSource).toContain('重置演示数据');
    expect(mePageSource).toContain('resetLocalDemoData()');
    expect(mePageSource).toContain('resetOnboarding()');
    expect(mePageSource).toContain('uni.showModal');
    expect(mePageSource).toContain('仅影响当前设备');
  });

  it('reenters onboarding directly so a surviving demo API profile cannot skip the flow', () => {
    expect(mePageSource).toContain("uni.reLaunch({ url: '/pages/onboarding/OnboardingPage' })");
    expect(mePageSource).not.toContain("uni.reLaunch({ url: '/pages/bootstrap/BootstrapPage' })");
  });

  it('clears both local demo keys and nothing else', () => {
    expect(localDemoSource).toContain('removeStorageSync(PROFILE_KEY)');
    expect(localDemoSource).toContain('removeStorageSync(PLAN_KEY)');
    expect(localDemoSource).not.toContain('clearStorageSync');
  });
});
