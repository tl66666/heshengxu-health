import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('daily home', () => {
  it('asks a user without a plan to create one', async () => {
    const app = await createApp();
    await app.init();
    const response = await request(app.getHttpServer())
      .get('/api/v1/daily-home/today?date=2026-08-25')
      .set('Authorization', `Bearer dev-home-empty-${Date.now()}`)
      .expect(200);

    expect(response.body.data).toMatchObject({ activePlan: null, dailyAction: { type: 'setup_plan' } });
    await app.close();
  });

  it('uses missing sleep as the first action for an active plan', async () => {
    const app = await createApp();
    await app.init();
    const client = request(app.getHttpServer());
    const authorization = { Authorization: `Bearer dev-home-plan-${Date.now()}` };
    await client
      .put('/api/v1/health-plans/current')
      .set(authorization)
      .send({ kind: 'weight', direction: 'lose', startDate: '2026-08-25' })
      .expect(200);

    const response = await client.get('/api/v1/daily-home/today?date=2026-08-25').set(authorization).expect(200);
    expect(response.body.data).toMatchObject({
      activePlan: { kind: 'weight' },
      dailyAction: { type: 'record_sleep' },
      recordingProgress: { completed: 0, total: 4 },
    });
    await app.close();
  });
});
