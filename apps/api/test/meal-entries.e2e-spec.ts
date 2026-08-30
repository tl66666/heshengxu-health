import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('meal entries', () => {
  it('records a personal food with the owner nutrition snapshot', async () => {
    const app = await createApp();
    await app.init();
    const client = request(app.getHttpServer());
    const authorization = { Authorization: `Bearer dev-personal-meal-${Date.now()}` };
    const personalFood = await client
      .post('/api/v1/user-foods')
      .set(authorization)
      .send({
        name: '自制燕麦杯',
        source: 'photo',
        energyKcal: 188,
        proteinG: 7,
        fatG: 5,
        carbohydrateG: 29,
        defaultServingLabel: '1 杯',
        defaultServingGrams: 180,
      })
      .expect(201);

    const created = await client
      .post('/api/v1/meal-entries')
      .set(authorization)
      .send({
        userFoodId: personalFood.body.data.id,
        grams: 90,
        mealType: 'breakfast',
        recordedAt: '2026-08-26T00:30:00.000Z',
      })
      .expect(201);

    expect(created.body.data).toMatchObject({
      foodId: null,
      userFoodId: personalFood.body.data.id,
      foodNameSnapshot: '自制燕麦杯',
      grams: 90,
      energyKcal: 169.2,
      proteinG: 6.3,
      fatG: 4.5,
      carbohydrateG: 26.1,
    });
    await app.close();
  });

  it('does not allow another user to record someone else\'s personal food', async () => {
    const app = await createApp();
    await app.init();
    const client = request(app.getHttpServer());
    const owner = { Authorization: `Bearer dev-personal-owner-${Date.now()}` };
    const other = { Authorization: `Bearer dev-personal-other-${Date.now()}` };
    const personalFood = await client
      .post('/api/v1/user-foods')
      .set(owner)
      .send({
        name: '私房沙拉',
        source: 'manual',
        energyKcal: 120,
        proteinG: 5,
        fatG: 4,
        carbohydrateG: 16,
        defaultServingLabel: '1 份',
        defaultServingGrams: 200,
      })
      .expect(201);

    await client
      .post('/api/v1/meal-entries')
      .set(other)
      .send({
        userFoodId: personalFood.body.data.id,
        grams: 100,
        mealType: 'lunch',
        recordedAt: '2026-08-26T04:00:00.000Z',
      })
      .expect(404);
    await app.close();
  });

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
