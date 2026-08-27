import { createMiniApiClient } from '../../services/mini-api.js';
import type { HealthProfile } from './health-profile.types.js';

export function loadHealthProfile() {
  return createMiniApiClient().get<HealthProfile>('/health-profiles/me');
}

export function saveHealthProfile(input: Partial<Omit<HealthProfile, 'userId'>>) {
  return createMiniApiClient().update<HealthProfile>('/health-profiles/me', input);
}
