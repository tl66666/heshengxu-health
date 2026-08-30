import { describe, expect, it } from 'vitest';
import pageSource from './WaterGoalPage.vue?raw';

describe('water goal page contracts', () => {
  it('uses the shared home water illustration for the recommendation result', () => {
    expect(pageSource).toContain('/static/icons/watercolor/water-drop.png');
    expect(pageSource).toContain('result-icon-image');
    expect(pageSource).not.toContain('result-icon">💧');
  });

  it('keeps goal editing and save actions available', () => {
    expect(pageSource).toContain('selectCustomGoal');
    expect(pageSource).toContain('saveGoal');
    expect(pageSource).toContain('water_daily_goal_custom');
    expect(pageSource).toContain('保存并应用目标');
  });
});
