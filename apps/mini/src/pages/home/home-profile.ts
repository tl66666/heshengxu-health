import { loadLocalProfile } from '../../features/health-loop/local-demo.js';
import { loadProfileForDisplay } from '../../features/health-profile/profile-loader.js';
import { loadHealthProfile } from '../../features/health-profile/health-profile.service.js';
import type { ProfileSex } from './home-card-settings.js';
export function localProfileSex(): ProfileSex {
  try {
    return loadLocalProfile()?.sex || 'unspecified';
  } catch {
    return 'unspecified';
  }
}
export async function loadHomeProfileSex(): Promise<ProfileSex> {
  try {
    return (
      (await loadProfileForDisplay(loadHealthProfile, loadLocalProfile)).profile?.sex ||
      'unspecified'
    );
  } catch {
    return 'unspecified';
  }
}
