import { describe, expect, it } from 'vitest';
import mePageSource from './MePage.vue?raw';
import localDemoSource from '../../features/health-loop/local-demo.js?raw';

describe('local health data on the me page', () => {
  it('offers an explicit local-only reset guarded by a confirm dialog', () => {
    expect(mePageSource).toContain('重置本机数据');
    expect(mePageSource).toContain('resetLocalDemoData()');
    expect(mePageSource).toContain('resetOnboarding()');
    expect(mePageSource).toContain('uni.showModal');
    expect(mePageSource).toContain('仅影响当前设备');
  });

  it('summarizes the health goals saved in the local profile', () => {
    expect(mePageSource).toContain('goalLabels[goal]');
    expect(mePageSource).toContain('localProfile.value?.goals');
    expect(mePageSource).toContain('localProfile.value = loadLocalProfile()');
  });

  it('reenters onboarding directly so a surviving demo API profile cannot skip the flow', () => {
    expect(mePageSource).toContain("uni.reLaunch({ url: '/pages/onboarding/OnboardingPage' })");
    expect(mePageSource).not.toContain("uni.reLaunch({ url: '/pages/bootstrap/BootstrapPage' })");
  });

  it('clears every health record namespace while preserving auth keys', () => {
    expect(localDemoSource).toContain('removeStorageSync(PROFILE_KEY)');
    expect(localDemoSource).toContain('removeStorageSync(PLAN_KEY)');
    expect(localDemoSource).toContain('heban.health.records.v1');
    expect(localDemoSource).toContain('heban_medication_reminders');
    expect(localDemoSource).toContain('heban_menstruation_cycle');
    expect(localDemoSource).toContain('water_daily_goal');
    expect(localDemoSource).toContain('heban.auth.');
  });
});
