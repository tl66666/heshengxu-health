import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('health profile onboarding', () => {
  it('updates the authenticated user profile and returns derived BMI', async () => {
    const app = await createApp();
    await app.init();

    const response = await request(app.getHttpServer())
      .put('/api/v1/health-profiles/me')
      .set('Authorization', 'Bearer dev-user-a')
      .send({
        displayName: '小序',
        sex: 'female',
        heightCm: 168,
        weightKg: 62,
        primaryGoal: 'weight_management',
      });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      userId: 'user-a',
      displayName: '小序',
      bmi: 22,
      bmiCategory: 'normal',
      primaryGoal: 'weight_management',
    });
    await app.close();
  });

  it('rejects client supplied identity fields', async () => {
    const app = await createApp();
    await app.init();

    const response = await request(app.getHttpServer())
      .put('/api/v1/health-profiles/me')
      .set('Authorization', 'Bearer dev-user-a')
      .send({ userId: 'user-b', heightCm: 168, weightKg: 62 });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_FAILED');
    await app.close();
  });

  it('rejects invalid BMI inputs and goals', async () => {
    const app = await createApp();
    await app.init();

    const response = await request(app.getHttpServer())
      .put('/api/v1/health-profiles/me')
      .set('Authorization', 'Bearer dev-user-a')
      .send({ heightCm: 0, weightKg: 62, primaryGoal: 'unknown' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_FAILED');
    await app.close();
  });
});
