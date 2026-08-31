import { describe, expect, it } from 'vitest';
import source from './SleepDetailPage.vue?raw';
describe('sleep detail page', () => {
  it('uses bedtime and wake time instead of manual minute entry', () => {
    expect(source).toContain('入睡时间'); expect(source).toContain('起床时间'); expect(source).toContain('sleepDuration'); expect(source).toContain('梦');
  });
});
