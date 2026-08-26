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
    const uploadId = 'unowned-upload';

    await client
      .post('/api/v1/food-recognition/jobs')
      .set(authorization)
      .send({ uploadId })
      .expect(403);

    await client.post('/api/v1/food-recognition/consents').set(authorization).expect(201);
    const upload = await client
      .post('/api/v1/food-recognition/uploads')
      .set(authorization)
      .send({ contentType: 'image/jpeg', sizeBytes: 1000 })
      .expect(201);
    await client
      .post(`/api/v1/food-recognition/uploads/${upload.body.data.id}/complete`)
      .set(authorization)
      .expect(200);
    await client
      .post('/api/v1/food-recognition/jobs')
      .set(authorization)
      .send({ uploadId: upload.body.data.id })
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
    expect(traces[1]?.requestHash).not.toBe(upload.body.data.objectKey);
    await app.close();
  });

  it('accepts only a completed upload owned by the current user', async () => {
    const app = await createApp();
    await app.init();
    const client = request(app.getHttpServer());
    const suffix = Date.now();
    const owner = { Authorization: `Bearer dev-upload-owner-${suffix}` };
    const other = { Authorization: `Bearer dev-upload-other-${suffix}` };

    await client.post('/api/v1/food-recognition/consents').set(owner).expect(201);
    await client
      .post('/api/v1/food-recognition/jobs')
      .set(owner)
      .send({ imageKey: 'mock/food-recognition/not-an-upload.jpg' })
      .expect(400);
    const upload = await client
      .post('/api/v1/food-recognition/uploads')
      .set(owner)
      .send({ contentType: 'image/jpeg', sizeBytes: 120_000 })
      .expect(201);

    expect(upload.body.data).toMatchObject({ status: 'pending', contentType: 'image/jpeg' });
    expect(upload.body.data.objectKey).not.toContain('wxfile:');

    await client
      .post(`/api/v1/food-recognition/uploads/${upload.body.data.id}/complete`)
      .set(other)
      .expect(404);
    await client
      .post(`/api/v1/food-recognition/uploads/${upload.body.data.id}/complete`)
      .set(owner)
      .expect(200)
      .expect(({ body }) => expect(body.data.status).toBe('ready'));
    await client.post('/api/v1/food-recognition/consents').set(other).expect(201);
    await client
      .post('/api/v1/food-recognition/jobs')
      .set(other)
      .send({ uploadId: upload.body.data.id })
      .expect(404);
    await client
      .post('/api/v1/food-recognition/jobs')
      .set(owner)
      .send({ uploadId: upload.body.data.id })
      .expect(201);
    await app.close();
  });
});
