import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('health profile persistence', () => {
  it('keeps an authenticated user profile after the API is restarted', async () => {
    const firstApp = await createApp();
    await firstApp.init();

    await request(firstApp.getHttpServer())
      .put('/api/v1/health-profiles/me')
      .set('Authorization', 'Bearer dev-persistent-user')
      .send({
        displayName: '序序',
        sex: 'female',
        heightCm: 168,
        weightKg: 62,
        primaryGoal: 'weight_management',
      })
      .expect(200);
    await firstApp.close();

    const secondApp = await createApp();
    await secondApp.init();
    const response = await request(secondApp.getHttpServer())
      .get('/api/v1/health-profiles/me')
      .set('Authorization', 'Bearer dev-persistent-user');

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      userId: 'persistent-user',
      displayName: '序序',
      primaryGoal: 'weight_management',
      bmi: 22,
      bmiCategory: 'normal',
    });
    await secondApp.close();
  });
});
