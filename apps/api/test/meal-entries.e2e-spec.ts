import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('meal entries', () => {
  it('versions an edited entry and hides a deleted entry from the daily list', async () => {
    const app = await createApp();
    await app.init();
    const client = request(app.getHttpServer());
    const authorization = { Authorization: `Bearer dev-meal-entry-${Date.now()}` };
    const recordedAt = '2026-08-26T08:00:00.000Z';
    const created = await client
      .post('/api/v1/meal-entries')
      .set(authorization)
      .send({ foodId: 'seed-protein-鸡蛋', grams: 50, mealType: 'breakfast', recordedAt })
      .expect(201);

    const replacement = await client
      .patch(`/api/v1/meal-entries/${created.body.data.id}`)
      .set(authorization)
      .send({ grams: 100, mealType: 'lunch' })
      .expect(200);
    expect(replacement.body.data).toMatchObject({
      grams: 100,
      mealType: 'lunch',
      previousRecordId: created.body.data.id,
      isCurrent: true,
    });

    await client
      .delete(`/api/v1/meal-entries/${replacement.body.data.id}`)
      .set(authorization)
      .expect(204);
    const current = await client
      .get('/api/v1/meal-entries?date=2026-08-26')
      .set(authorization)
      .expect(200);
    expect(current.body.data).toEqual([]);
    await app.close();
  });
});
