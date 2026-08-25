import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('health plans', () => {
  it('creates an active weight target, plan, and daily tasks', async () => {
    const app = await createApp();
    await app.init();
    const client = request(app.getHttpServer());
    const authorization = { Authorization: `Bearer dev-plan-user-${Date.now()}` };

    const response = await client
      .put('/api/v1/health-plans/current')
      .set(authorization)
      .send({ kind: 'weight', direction: 'lose', targetWeightKg: 58, startDate: '2026-08-25' })
      .expect(200);

    expect(response.body.data).toMatchObject({
      kind: 'weight',
      status: 'active',
      ruleVersion: 'daily-loop-v1',
      healthTarget: { kind: 'weight', direction: 'lose', targetWeightKg: 58, status: 'active' },
    });
    expect(response.body.data.tasks.map((task: { actionType: string }) => task.actionType)).toEqual(
      expect.arrayContaining(['record_weight', 'record_meal', 'walk_15_minutes']),
    );
    await app.close();
  });

  it('rejects incompatible plan fields and prevents cross-user task updates', async () => {
    const app = await createApp();
    await app.init();
    const client = request(app.getHttpServer());
    const suffix = Date.now();
    const owner = { Authorization: `Bearer dev-plan-owner-${suffix}` };
    const other = { Authorization: `Bearer dev-plan-other-${suffix}` };

    await client
      .put('/api/v1/health-plans/current')
      .set(owner)
      .send({ kind: 'sleep', direction: 'lose', startDate: '2026-08-25' })
      .expect(400)
      .expect(({ body }) => expect(body.error.code).toBe('VALIDATION_FAILED'));

    const created = await client
      .put('/api/v1/health-plans/current')
      .set(owner)
      .send({ kind: 'sleep', startDate: '2026-08-25' })
      .expect(200);
    const taskId = created.body.data.tasks[0].id;

    await client
      .patch(`/api/v1/health-plans/tasks/${taskId}`)
      .set(other)
      .send({ status: 'completed' })
      .expect(404);
    const completed = await client
      .patch(`/api/v1/health-plans/tasks/${taskId}`)
      .set(owner)
      .send({ status: 'completed' })
      .expect(200);
    expect(completed.body.data).toMatchObject({
      status: 'completed',
      completedAt: expect.any(String),
    });
    await app.close();
  });
});
