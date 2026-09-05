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

  it('sends the persisted access token when the App runtime resolves production API', async () => {
    const request = vi.fn().mockResolvedValue({
      statusCode: 200,
      data: { data: { ok: true } },
    });
    const previousUni = (globalThis as { uni?: unknown }).uni;
    (globalThis as { uni?: unknown }).uni = {
      getSystemInfoSync: () => ({ uniPlatform: 'app-plus' }),
      getStorageSync: (key: string) => (key === 'heban.auth.access-token' ? 'access-123' : ''),
      request: vi.fn(),
    };

    try {
      const client = createMiniApiClient(undefined, request);
      await expect(client.get('/health')).resolves.toEqual({ ok: true });
      expect(request).toHaveBeenCalledWith({
        url: 'https://api-heshengxu-prod.yellowsky-5fa044e1.eastasia.azurecontainerapps.io/api/v1/health',
        method: 'GET',
        data: undefined,
        header: { Authorization: 'Bearer access-123' },
      });
    } finally {
      if (previousUni === undefined) delete (globalThis as { uni?: unknown }).uni;
      else (globalThis as { uni?: unknown }).uni = previousUni;
    }
  });
});
