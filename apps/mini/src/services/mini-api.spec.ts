import { describe, expect, it, vi } from 'vitest';
import { createMiniApiClient } from './mini-api.js';

describe('createMiniApiClient', () => {
  it('does not send the local development identity to a configured HTTPS endpoint', async () => {
    const request = vi.fn().mockResolvedValue({
      statusCode: 200,
      data: { data: { ok: true } },
    });
    const client = createMiniApiClient(
      { apiBaseUrl: 'https://api.example.test/api/v1', authorization: undefined },
      request,
    );

    await expect(client.get('/health')).resolves.toEqual({ ok: true });
    expect(request).toHaveBeenCalledWith({
      url: 'https://api.example.test/api/v1/health',
      method: 'GET',
      data: undefined,
      header: {},
    });
  });
});
