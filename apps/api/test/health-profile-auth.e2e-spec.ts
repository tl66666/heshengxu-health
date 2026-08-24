import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('health profile authorization', () => {
  it('rejects an unauthenticated profile request', async () => {
    const app = await createApp();
    await app.init();
    const response = await request(app.getHttpServer()).get('/api/v1/health-profiles/me');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHENTICATED');
    await app.close();
  });

  it('uses the token subject instead of a client supplied user id', async () => {
    const app = await createApp();
    await app.init();
    const response = await request(app.getHttpServer())
      .get('/api/v1/health-profiles/me?userId=another-user')
      .set('Authorization', 'Bearer dev-user-a');

    expect(response.status).toBe(200);
    expect(response.body.data.userId).toBe('user-a');
    await app.close();
  });
});
