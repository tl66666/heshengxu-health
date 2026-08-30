import { describe, expect, it } from 'vitest';
import waterPageSource from './WaterPage.vue?raw';

describe('water page navigation contract', () => {
  it('routes personalization setup through the shared navigator with a fallback', () => {
    expect(waterPageSource).toContain("navigateTo('/pages/water-goal/WaterGoalPage'");
    expect(waterPageSource).toContain("uni.redirectTo({ url: '/pages/water-goal/WaterGoalPage' })");
    expect(waterPageSource).not.toContain("function goToSetup() {\n  uni.navigateTo({");
  });
});
