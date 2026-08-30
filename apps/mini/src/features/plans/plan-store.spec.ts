import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PLAN_TEMPLATES, addCustomPlan, addTemplatePlan, loadHabitPlans, toggleHabitTask } from './plan-store.js';

const storage = new Map<string, unknown>();
vi.stubGlobal('uni', {
  getStorageSync: (key: string) => storage.get(key),
  setStorageSync: (key: string, value: unknown) => storage.set(key, value),
});

describe('habit plan store', () => {
  beforeEach(() => storage.clear());

  it('adds a template once and creates checkable tasks', () => {
    const first = addTemplatePlan(PLAN_TEMPLATES[0]);
    const second = addTemplatePlan(PLAN_TEMPLATES[0]);
    expect(first.added).toBe(true);
    expect(second.added).toBe(false);
    expect(loadHabitPlans()[0].tasks[0].doneDates).toEqual([]);
  });

  it('toggles a task for a specific day without losing other days', () => {
    const { plan } = addCustomPlan({ title: '晒太阳', subtitle: '', category: 'custom', frequency: '每天' });
    toggleHabitTask(plan.id, plan.tasks[0].id, '2026-08-30');
    toggleHabitTask(plan.id, plan.tasks[0].id, '2026-08-31');
    expect(loadHabitPlans()[0].tasks[0].doneDates).toEqual(['2026-08-30', '2026-08-31']);
    toggleHabitTask(plan.id, plan.tasks[0].id, '2026-08-30');
    expect(loadHabitPlans()[0].tasks[0].doneDates).toEqual(['2026-08-31']);
  });
});
