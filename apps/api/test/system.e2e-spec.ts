import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('system endpoint', () => {
  it('returns an envelope and request id from health', async () => {
    const app = await createApp();
    await app.init();
    const response = await request(app.getHttpServer()).get('/health');

    expect(response.status).toBe(200);
    expect(response.headers['x-request-id']).toEqual(expect.any(String));
    expect(response.body).toEqual({
      data: { status: 'ok' },
      meta: { requestId: response.headers['x-request-id'] },
    });

    await app.close();
  });
});
