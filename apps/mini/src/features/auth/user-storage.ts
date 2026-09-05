const USER_ID_KEY = 'heban.auth.user-id';

export function userStorageKey(baseKey: string) {
  try {
    const userId = uni.getStorageSync(USER_ID_KEY);
    if (typeof userId === 'string' && userId.trim()) {
      return `${baseKey}.user.${userId.trim()}`;
    }
  } catch {
    // Storage may be unavailable during the first render.
  }
  return baseKey;
}
