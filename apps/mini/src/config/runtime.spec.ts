import { describe, expect, it } from 'vitest';
import { resolveMiniRuntime } from './runtime.js';

describe('resolveMiniRuntime', () => {
  it('uses the local API and development identity by default', () => {
    expect(resolveMiniRuntime({})).toEqual({
      apiBaseUrl: 'http://127.0.0.1:3000/api/v1',
      authorization: 'Bearer dev-mini-user',
    });
  });

  it('uses a configured HTTPS API endpoint without the development identity', () => {
    expect(
      resolveMiniRuntime({ VITE_MINI_API_BASE_URL: 'https://api.example.test/api/v1/' }),
    ).toEqual({
      apiBaseUrl: 'https://api.example.test/api/v1',
      authorization: undefined,
    });
  });

  it('uses the production API for an App build when no Vite variable is injected', () => {
    expect(resolveMiniRuntime({ UNI_PLATFORM: 'app-plus' })).toEqual({
      apiBaseUrl: 'https://api-heshengxu-prod.yellowsky-5fa044e1.eastasia.azurecontainerapps.io/api/v1',
      authorization: undefined,
    });
  });
});
