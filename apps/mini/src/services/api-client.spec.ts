import { describe, expect, it } from 'vitest';
import { createApiClient } from './api-client.js';

describe('createApiClient', () => {
  it('keeps API error code and request id when a request fails', async () => {
    const client = createApiClient({
      baseUrl: 'https://example.test/api/v1',
      request: async () => ({
        statusCode: 401,
        data: {
          error: { code: 'UNAUTHENTICATED', message: '需要登录', requestId: 'r1' },
        },
      }),
    });

    await expect(client.get('/health-profiles/me')).rejects.toThrow('UNAUTHENTICATED [r1]');
  });

  it('sends a JSON PUT body for profile updates', async () => {
    let captured: unknown;
    const client = createApiClient({
      baseUrl: 'https://example.test/api/v1',
      request: async (request) => {
        captured = request;
        return { statusCode: 200, data: { data: { saved: true } } } as never;
      },
    });

    await expect(client.update('/health-profiles/me', { heightCm: 168 })).resolves.toEqual({
      saved: true,
    });
    expect(captured).toEqual({
      url: 'https://example.test/api/v1/health-profiles/me',
      method: 'PUT',
      data: { heightCm: 168 },
    });
  });

  it('sends POST and PATCH requests with the supplied body', async () => {
    const requests: unknown[] = [];
    const client = createApiClient({
      baseUrl: 'https://example.test/api/v1',
      request: async (request) => {
        requests.push(request);
        return { statusCode: 200, data: { data: { ok: true } } } as never;
      },
    });

    await client.post('/health-records/weights', { valueKg: 61.8 });
    await client.patch('/health-plans/tasks/task-1', { status: 'completed' });

    expect(requests).toEqual([
      {
        url: 'https://example.test/api/v1/health-records/weights',
        method: 'POST',
        data: { valueKg: 61.8 },
      },
      {
        url: 'https://example.test/api/v1/health-plans/tasks/task-1',
        method: 'PATCH',
        data: { status: 'completed' },
      },
    ]);
  });
});
