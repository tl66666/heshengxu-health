import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PLAN_TEMPLATES, addCustomPlan, addHabitTask, addTemplatePlan, loadHabitPlans, removeHabitPlan, toggleHabitTask, updateHabitPlan, weekSummary } from './plan-store.js';

const storage = new Map<string, unknown>();
vi.stubGlobal('uni', {
  getStorageSync: (key: string) => storage.get(key),
  setStorageSync: (key: string, value: unknown) => storage.set(key, value),
});

describe('habit plan store', () => {
  beforeEach(() => storage.clear());

  it('adds a template once and creates checkable tasks', () => {
    const first = addTemplatePlan(PLAN_TEMPLATES[0]!);
    const second = addTemplatePlan(PLAN_TEMPLATES[0]!);
    expect(first.added).toBe(true);
    expect(second.added).toBe(false);
    expect(loadHabitPlans()[0]?.tasks[0]?.doneDates).toEqual([]);
  });

  it('toggles a task for a specific day without losing other days', () => {
    const { plan } = addCustomPlan({ title: '晒太阳', subtitle: '', category: 'custom', frequency: '每天' });
    const taskId = plan.tasks[0]!.id;
    toggleHabitTask(plan.id, taskId, '2026-08-30');
    toggleHabitTask(plan.id, taskId, '2026-08-31');
    expect(loadHabitPlans()[0]?.tasks[0]?.doneDates).toEqual(['2026-08-30', '2026-08-31']);
    toggleHabitTask(plan.id, taskId, '2026-08-30');
    expect(loadHabitPlans()[0]?.tasks[0]?.doneDates).toEqual(['2026-08-31']);
  });

  it('edits, extends, and archives a plan', () => {
    const { plan } = addCustomPlan({ title: '晨间散步', subtitle: '', category: 'exercise', frequency: '每天' });
    updateHabitPlan(plan.id, { title: '晨间散步 20 分钟', subtitle: '给一天留一点空气' });
    addHabitTask(plan.id, '记录今天的心情');
    expect(loadHabitPlans()[0]?.tasks).toHaveLength(2);
    expect(loadHabitPlans()[0]?.title).toBe('晨间散步 20 分钟');
    removeHabitPlan(plan.id);
    expect(loadHabitPlans()).toEqual([]);
  });

  it('returns a seven-day summary for the review chart', () => {
    addCustomPlan({ title: '喝水', subtitle: '', category: 'custom', frequency: '每天' });
    expect(weekSummary(loadHabitPlans())).toHaveLength(7);
  });
});
