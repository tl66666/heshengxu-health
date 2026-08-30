import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('user foods', () => {
  it('creates, searches case-insensitively for the owner, and deletes a personal food', async () => {
    const app = await createApp();
    await app.init();
    const client = request(app.getHttpServer());
    const owner = { Authorization: `Bearer dev-user-food-${Date.now()}` };
    const other = { Authorization: `Bearer dev-other-food-${Date.now()}` };

    const created = await client
      .post('/api/v1/user-foods')
      .set(owner)
      .send({
        name: '香煎鸡胸',
        imageUrl: 'https://example.test/chicken.jpg',
        source: 'photo',
        energyKcal: 165,
        proteinG: 31,
        fatG: 3.6,
        carbohydrateG: 1.2,
        defaultServingLabel: '一块',
        defaultServingGrams: 150,
      })
      .expect(201);

    expect(created.body.data).toMatchObject({
      name: '香煎鸡胸',
      source: 'photo',
      energyKcal: 165,
      defaultServingGrams: 150,
    });

    const newest = await client
      .post('/api/v1/user-foods')
      .set(owner)
      .send({
        name: 'Oat Bowl',
        source: 'manual',
        energyKcal: 240,
        proteinG: 8,
        fatG: 6,
        carbohydrateG: 38,
        defaultServingLabel: '1 bowl',
        defaultServingGrams: 220,
      })
      .expect(201);

    const newestFirst = await client.get('/api/v1/user-foods').set(owner).expect(200);
    expect(newestFirst.body.data.map((food: { id: string }) => food.id)).toEqual([
      newest.body.data.id,
      created.body.data.id,
    ]);

    const caseInsensitive = await client.get('/api/v1/user-foods?q=oAt').set(owner).expect(200);
    expect(caseInsensitive.body.data.map((food: { id: string }) => food.id)).toEqual([
      newest.body.data.id,
    ]);

    const listed = await client
      .get('/api/v1/user-foods?q=鸡胸')
      .set(owner)
      .expect(200);
    expect(listed.body.data).toHaveLength(1);
    expect(listed.body.data[0].id).toBe(created.body.data.id);

    const hidden = await client.get('/api/v1/user-foods').set(other).expect(200);
    expect(hidden.body.data).toEqual([]);

    await client
      .delete(`/api/v1/user-foods/${created.body.data.id}`)
      .set(owner)
      .expect(204);
    await client.delete(`/api/v1/user-foods/${newest.body.data.id}`).set(owner).expect(204);
    const afterDelete = await client.get('/api/v1/user-foods').set(owner).expect(200);
    expect(afterDelete.body.data).toEqual([]);
    await app.close();
  });

  it('rejects non-positive nutrition and serving values', async () => {
    const app = await createApp();
    await app.init();
    await request(app.getHttpServer())
      .post('/api/v1/user-foods')
      .set({ Authorization: `Bearer dev-user-food-invalid-${Date.now()}` })
      .send({
        name: '无效食物',
        source: 'manual',
        energyKcal: 0,
        proteinG: 1,
        fatG: 1,
        carbohydrateG: 1,
        defaultServingLabel: '份',
        defaultServingGrams: -1,
      })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/v1/user-foods')
      .set({ Authorization: `Bearer dev-user-food-zero-${Date.now()}` })
      .send({
        name: '零热量食物',
        source: 'manual',
        energyKcal: 0,
        proteinG: 1,
        fatG: 1,
        carbohydrateG: 1,
        defaultServingLabel: '份',
        defaultServingGrams: 100,
      })
      .expect(400);
    await app.close();
  });

  it('rejects whitespace-only names and serving labels', async () => {
    const app = await createApp();
    await app.init();
    await request(app.getHttpServer())
      .post('/api/v1/user-foods')
      .set({ Authorization: `Bearer dev-user-food-whitespace-${Date.now()}` })
      .send({
        name: '   ',
        source: 'manual',
        energyKcal: 100,
        proteinG: 1,
        fatG: 1,
        carbohydrateG: 1,
        defaultServingLabel: '   ',
        defaultServingGrams: 100,
      })
      .expect(400);
    await app.close();
  });

  it('rejects unknown personal food sources', async () => {
    const app = await createApp();
    await app.init();
    await request(app.getHttpServer())
      .post('/api/v1/user-foods')
      .set({ Authorization: `Bearer dev-user-food-source-${Date.now()}` })
      .send({
        name: '自定义食物',
        source: 'imported',
        energyKcal: 100,
        proteinG: 1,
        fatG: 1,
        carbohydrateG: 1,
        defaultServingLabel: '1份',
        defaultServingGrams: 100,
      })
      .expect(400);
    await app.close();
  });
});
