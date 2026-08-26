import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('weekly health insights', () => {
  it('aggregates only the current users current records for the requested week', async () => {
    const app = await createApp();
    await app.init();
    const client = request(app.getHttpServer());
    const suffix = Date.now();
    const owner = { Authorization: `Bearer dev-insights-owner-${suffix}` };
    const other = { Authorization: `Bearer dev-insights-other-${suffix}` };
    const foods = await client.get('/api/v1/foods/search').set(owner).expect(200);
    const food = foods.body.data[0];
    expect(food).toBeDefined();

    await client
      .post('/api/v1/health-records/weights')
      .set(owner)
      .send({ valueKg: 62, recordedAt: '2026-08-24T00:00:00.000Z' })
      .expect(201);
    await client
      .post('/api/v1/health-records/activities')
      .set(owner)
      .send({ activityType: 'walk', durationMinutes: 30, recordedAt: '2026-08-26T00:00:00.000Z' })
      .expect(201);
    const meal = await client
      .post('/api/v1/meal-entries')
      .set(owner)
      .send({ foodId: food.id, grams: 100, mealType: 'lunch', recordedAt: '2026-08-25T00:00:00.000Z' })
      .expect(201);
    await client
      .patch(`/api/v1/meal-entries/${meal.body.data.id}`)
      .set(owner)
      .send({ grams: 200 })
      .expect(200);
    await client
      .post('/api/v1/health-records/weights')
      .set(other)
      .send({ valueKg: 80, recordedAt: '2026-08-25T00:00:00.000Z' })
      .expect(201);

    const response = await client
      .get('/api/v1/health-insights/weekly?date=2026-08-26')
      .set(owner)
      .expect(200);

    expect(response.body.data).toMatchObject({
      timeZone: 'Asia/Shanghai',
      range: { startDate: '2026-08-24', endDate: '2026-08-30' },
      coverage: { recordedDayCount: 3, requiredDayCount: 3, status: 'ready' },
      weight: { recordCount: 1, points: [{ date: '2026-08-24', valueKg: 62 }] },
      food: { recordedDayCount: 1, entryCount: 1, energyKcal: food.nutrition.energyKcal * 2 },
      activity: { recordCount: 1, durationMinutes: 30 },
    });
    await app.close();
  });
});
