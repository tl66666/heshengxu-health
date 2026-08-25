import { describe, expect, it } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('daily health loop persistence schema', () => {
  it('stores all four record types for one user', async () => {
    const userId = `daily-loop-schema-${Date.now()}`;
    await prisma.user.create({ data: { id: userId } });

    const recordedAt = new Date('2026-08-25T08:00:00.000Z');
    const weight = await prisma.weightRecord.create({
      data: { userId, valueKg: 61.8, recordedAt },
    });
    const meal = await prisma.mealStructureRecord.create({
      data: {
        userId,
        mealType: 'lunch',
        hasStaple: true,
        hasProtein: true,
        hasVegetable: false,
        recordedAt,
      },
    });
    const activity = await prisma.activityRecord.create({
      data: { userId, activityType: 'walk', durationMinutes: 15, recordedAt },
    });
    const sleep = await prisma.sleepRecord.create({
      data: { userId, durationMinutes: 430, quality: 'good', recordedAt },
    });

    expect(weight.isCurrent).toBe(true);
    expect(meal.isCurrent).toBe(true);
    expect(activity.isCurrent).toBe(true);
    expect(sleep.isCurrent).toBe(true);
  });

  it('links an active target, plan, and unique daily task', async () => {
    const userId = `daily-loop-plan-${Date.now()}`;
    await prisma.user.create({ data: { id: userId } });
    const target = await prisma.healthTarget.create({
      data: { userId, kind: 'weight', direction: 'lose', startDate: new Date('2026-08-25') },
    });
    const plan = await prisma.personalPlan.create({
      data: {
        userId,
        healthTargetId: target.id,
        kind: 'weight',
        startDate: new Date('2026-08-25'),
        ruleVersion: 'daily-loop-v1',
      },
    });

    await prisma.planTask.create({
      data: { planId: plan.id, scheduledFor: new Date('2026-08-25'), actionType: 'record_weight' },
    });

    await expect(
      prisma.planTask.create({
        data: {
          planId: plan.id,
          scheduledFor: new Date('2026-08-25'),
          actionType: 'record_weight',
        },
      }),
    ).rejects.toMatchObject({ code: 'P2002' });
  });
});
