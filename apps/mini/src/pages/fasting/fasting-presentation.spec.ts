import { describe, expect, it } from 'vitest';
import source from './FastingDetailPage.vue?raw';

describe('fasting page presentation contract', () => {
  it('keeps the real fasting workflow visible', () => {
    expect(source).toContain('提前开始断食');
    expect(source).toContain('结束并记录');
    expect(source).toContain('用餐打卡');
    expect(source).toContain('设置用餐时间');
    expect(source).toContain('保存设置');
  });

  it('uses persisted plan data instead of seeded history', () => {
    expect(source).toContain('loadFastingPlan');
    expect(source).toContain('saveFastingPlan');
    expect(source).toContain('recordMeal');
    expect(source).toContain('removeMeal');
    expect(source).not.toContain('2024-');
  });
});
