import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('health records', () => {
  it('creates four record types and returns only current records for a day', async () => {
    const app = await createApp();
    await app.init();
    const client = request(app.getHttpServer());
    const authorization = { Authorization: `Bearer dev-record-user-${Date.now()}` };
    const recordedAt = '2026-08-25T08:10:00.000Z';

    const weight = await client
      .post('/api/v1/health-records/weights')
      .set(authorization)
      .send({ valueKg: 61.8, recordedAt })
      .expect(201);
    await client
      .post('/api/v1/health-records/meal-structures')
      .set(authorization)
      .send({
        mealType: 'lunch',
        hasStaple: true,
        hasProtein: true,
        hasVegetable: false,
        recordedAt,
      })
      .expect(201);
    await client
      .post('/api/v1/health-records/activities')
      .set(authorization)
      .send({ activityType: 'walk', durationMinutes: 15, recordedAt })
      .expect(201);
    await client
      .post('/api/v1/health-records/sleeps')
      .set(authorization)
      .send({ durationMinutes: 430, quality: 'good', recordedAt })
      .expect(201);

    expect(weight.body.data).toMatchObject({ valueKg: 61.8, isCurrent: true });

    const today = await client
      .get('/api/v1/health-records/today?date=2026-08-25')
      .set(authorization)
      .expect(200);
    expect(today.body.data).toMatchObject({
      timeZone: 'Asia/Shanghai',
      weight: { valueKg: 61.8, isCurrent: true },
      meals: [{ mealType: 'lunch' }],
      activities: [{ activityType: 'walk' }],
      sleep: { durationMinutes: 430, quality: 'good' },
    });
    const history = await client
      .get('/api/v1/health-records/weights/history?from=2026-08-01T00:00:00.000Z')
      .set(authorization)
      .expect(200);
    expect(history.body.data).toEqual([
      expect.objectContaining({ valueKg: 61.8, isCurrent: true }),
    ]);
    await app.close();
  });

  it('replaces a weight record without overwriting the historical record', async () => {
    const app = await createApp();
    await app.init();
    const client = request(app.getHttpServer());
    const authorization = { Authorization: `Bearer dev-replace-user-${Date.now()}` };
    const recordedAt = '2026-08-25T08:10:00.000Z';
    const original = await client
      .post('/api/v1/health-records/weights')
      .set(authorization)
      .send({ valueKg: 61.8, recordedAt })
      .expect(201);

    const replacement = await client
      .patch(`/api/v1/health-records/weight/${original.body.data.id}`)
      .set(authorization)
      .send({ valueKg: 61.6, recordedAt })
      .expect(200);

    expect(replacement.body.data).toMatchObject({
      valueKg: 61.6,
      isCurrent: true,
      previousRecordId: original.body.data.id,
    });
    const today = await client
      .get('/api/v1/health-records/today?date=2026-08-25')
      .set(authorization)
      .expect(200);
    expect(today.body.data.weight).toMatchObject({ id: replacement.body.data.id, valueKg: 61.6 });
    await app.close();
  });

  it('does not expose another users records and rejects invalid input', async () => {
    const app = await createApp();
    await app.init();
    const client = request(app.getHttpServer());
    const suffix = Date.now();
    const first = { Authorization: `Bearer dev-owner-${suffix}` };
    const second = { Authorization: `Bearer dev-other-${suffix}` };
    const created = await client
      .post('/api/v1/health-records/weights')
      .set(first)
      .send({ valueKg: 61.8, recordedAt: '2026-08-25T08:10:00.000Z' })
      .expect(201);

    await client
      .patch(`/api/v1/health-records/weight/${created.body.data.id}`)
      .set(second)
      .send({ valueKg: 60, recordedAt: '2026-08-25T08:10:00.000Z' })
      .expect(404);
    await client
      .post('/api/v1/health-records/sleeps')
      .set(first)
      .send({ durationMinutes: 12, quality: 'unknown', recordedAt: '2026-08-25T08:10:00.000Z' })
      .expect(400)
      .expect(({ body }) => expect(body.error.code).toBe('VALIDATION_FAILED'));
    await app.close();
  });
});
