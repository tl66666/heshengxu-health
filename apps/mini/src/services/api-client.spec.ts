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
});
