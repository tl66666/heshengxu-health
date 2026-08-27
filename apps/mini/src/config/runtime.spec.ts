import { describe, expect, it } from 'vitest';
import { resolveMiniRuntime } from './runtime.js';

describe('resolveMiniRuntime', () => {
  it('uses the local API and development identity by default', () => {
    expect(resolveMiniRuntime({})).toEqual({
      apiBaseUrl: 'http://localhost:3000/api/v1',
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
});
