import { loadLocalProfile } from '../health-loop/local-demo.js';
import { loadHealthProfile } from '../health-profile/health-profile.service.js';
import { loadProfileForDisplay } from '../health-profile/profile-loader.js';
import { userStorageKey } from '../auth/user-storage.js';
import { shanghaiDate, validDate } from './calendar.js';
function underageBirthDate(birth?: string | null): boolean | null {
  const today = shanghaiDate();
  return birth && validDate(birth)
    ? birth > `${Number(today.slice(0, 4)) - 18}${today.slice(4)}`
    : null;
}
export function localUnderageProfile(): boolean | null {
  try {
    return underageBirthDate(loadLocalProfile()?.birthDate);
  } catch {
    return null;
  }
}
export async function resolveUnderageProfile(): Promise<boolean | null> {
  const account = userStorageKey('lean-eligibility');
  try {
    const result = await loadProfileForDisplay(loadHealthProfile, loadLocalProfile);
    return account === userStorageKey('lean-eligibility')
      ? underageBirthDate(result.profile?.birthDate)
      : null;
  } catch {
    return null;
  }
}
