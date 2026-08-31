import { describe, expect, it } from 'vitest';
import pageSource from './HomePage.vue?raw';

describe('home fasting live card', () => {
  it('renders the persisted fasting plan and live elapsed time', () => {
    expect(pageSource).toContain('loadFastingPlan');
    expect(pageSource).toContain('fastingElapsed');
    expect(pageSource).toContain('fastingPlan.active');
    expect(pageSource).not.toContain('09:00 - 17:00');
    expect(pageSource).not.toContain('点击进入轻断食计时与用餐打卡');
  });
});
