import { createApiClient } from '../../services/api-client.js';
import type { HealthProfile } from './health-profile.types.js';

function client() {
  return createApiClient({
    baseUrl: 'http://localhost:3000/api/v1',
    request: ({ url, method, data }) =>
      new Promise((resolve, reject) => {
        uni.request({
          url,
          method: method as never,
          data: data as Record<string, unknown>,
          header: { Authorization: 'Bearer dev-mini-user' },
          success: (response) => resolve({ statusCode: response.statusCode, data: response.data as never }),
          fail: reject,
        });
      }),
  });
}

export function loadHealthProfile() {
  return client().get<HealthProfile>('/health-profiles/me');
}

export function saveHealthProfile(input: Partial<Omit<HealthProfile, 'userId'>>) {
  return client().update<HealthProfile>('/health-profiles/me', input);
}
