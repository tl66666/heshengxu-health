import { describe, expect, it } from 'vitest';
import type { DailyHomeDto } from '../../../../../packages/contracts/src/health-loop.js';
import { deriveDailyExperience } from './daily-experience.js';

const base: DailyHomeDto = {
  date: '2026-08-25',
  displayName: '小乐',
  activePlan: null,
  todayRecords: {
    weight: null,
    meals: [],
    activities: [],
    sleep: null,
    timeZone: 'Asia/Shanghai',
  },
  todayTasks: [],
  dailyAction: {
    type: 'setup_plan',
    title: '设置你的第一份计划',
    description: '选一个方向开始。',
    route: '/pages/plan-setup/PlanSetupPage',
  },
  recordingProgress: {
    completed: 0,
    total: 4,
    hasWeight: false,
    hasMeal: false,
    hasActivity: false,
    hasSleep: false,
  },
};

describe('deriveDailyExperience', () => {
  it('keeps the API daily action as the only home primary action', () => {
    const result = deriveDailyExperience(base);

    expect(result.hero).toMatchObject({
      eyebrow: '今日陪伴',
      title: '设置你的第一份计划',
      route: '/pages/plan-setup/PlanSetupPage',
    });
  });

  it('puts incomplete plan tasks before completed tasks and limits them to three', () => {
    const result = deriveDailyExperience({
      ...base,
      todayTasks: [
        {
          id: 'done',
          actionType: 'record_weight',
          status: 'completed',
          scheduledFor: base.date,
          completedAt: '2026-08-25T01:00:00.000Z',
        },
        {
          id: 'sleep',
          actionType: 'record_sleep',
          status: 'pending',
          scheduledFor: base.date,
          completedAt: null,
        },
        {
          id: 'meal',
          actionType: 'record_meal',
          status: 'pending',
          scheduledFor: base.date,
          completedAt: null,
        },
        {
          id: 'walk',
          actionType: 'walk_15_minutes',
          status: 'pending',
          scheduledFor: base.date,
          completedAt: null,
        },
      ],
    });

    expect(result.tasks.map((task) => task.id)).toEqual(['sleep', 'meal', 'walk']);
  });

  it('uses a different Xuxu message when all record categories are complete', () => {
    expect(deriveDailyExperience(base).recording.message).toContain('从一件最容易的小事开始');

    const complete = deriveDailyExperience({
      ...base,
      recordingProgress: {
        completed: 4,
        total: 4,
        hasWeight: true,
        hasMeal: true,
        hasActivity: true,
        hasSleep: true,
      },
    });

    expect(complete.recording.message).toContain('今天的记录已经齐了');
  });
});
