import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { PrismaService } from '../src/common/database/prisma.service.js';

describe('food recognition consent and audit', () => {
  it('requires image-recognition consent and stores a hashed provider audit', async () => {
    const app = await createApp();
    await app.init();
    const client = request(app.getHttpServer());
    const suffix = Date.now();
    const userId = `recognition-user-${suffix}`;
    const authorization = { Authorization: `Bearer dev-${userId}` };
    const imageKey = `mock/recognition/${userId}/meal.jpg`;

    await client
      .post('/api/v1/food-recognition/jobs')
      .set(authorization)
      .send({ imageKey })
      .expect(403);

    await client.post('/api/v1/food-recognition/consents').set(authorization).expect(201);
    await client
      .post('/api/v1/food-recognition/jobs')
      .set(authorization)
      .send({ imageKey })
      .expect(201);

    const traces = await app.get(PrismaService).aiTrace.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    expect(traces).toHaveLength(2);
    expect(traces[0]).toMatchObject({
      safetyDecision: 'block',
      safetyReason: 'image_recognition_consent_required',
    });
    expect(traces[1]).toMatchObject({
      safetyDecision: 'allow',
      provider: 'mock',
      model: 'food-recognition-mock-v1',
    });
    expect(traces[1]?.requestHash).not.toBe(imageKey);
    await app.close();
  });
});
