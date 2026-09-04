import { createMiniApiClient } from '../../services/mini-api.js';
import { migrateGuestPlansToUser } from '../plans/plan-store.js';

const ACCESS_KEY = 'heban.auth.access-token';
const REFRESH_KEY = 'heban.auth.refresh-token';
const USER_KEY = 'heban.auth.user-id';

export function accessToken() {
  const value = uni.getStorageSync(ACCESS_KEY);
  return typeof value === 'string' ? value : undefined;
}

export function isSignedIn() {
  return Boolean(accessToken());
}

export function isWechatLoginConfigured() {
  return Boolean(
    (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_MINI_API_BASE_URL,
  );
}

export function isAppRuntime() {
  try {
    const platform = uni.getSystemInfoSync().uniPlatform;
    return platform === 'app' || platform === 'app-plus';
  } catch {
    return false;
  }
}

export async function loginWithWechat() {
  const login = await new Promise<{ code: string }>((resolve, reject) => {
    uni.login({ provider: 'weixin', success: resolve, fail: reject });
  });
  const result = await createMiniApiClient({
    apiBaseUrl: (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_MINI_API_BASE_URL || 'http://127.0.0.1:3000/api/v1',
    authorization: undefined,
  }).post<{ accessToken: string; refreshToken: string; userId: string }>('/auth/wechat/login', { code: login.code });
  uni.setStorageSync(ACCESS_KEY, result.accessToken);
  uni.setStorageSync(REFRESH_KEY, result.refreshToken);
  uni.setStorageSync(USER_KEY, result.userId);
  migrateGuestPlansToUser(result.userId);
  return result;
}

export async function registerWithPassword(email: string, password: string) {
  const result = await createMiniApiClient({ apiBaseUrl: apiBase(), authorization: undefined }).post<{ provider: 'app_password'; userId: string }>('/auth/app/register', { email: normalizeEmail(email), password });
  return result;
}

export async function loginWithPassword(email: string, password: string) {
  const result = await createMiniApiClient({ apiBaseUrl: apiBase(), authorization: undefined }).post<{ accessToken: string; refreshToken: string; userId: string }>('/auth/app/login', { email: normalizeEmail(email), password });
  persistAuth(result);
  return result;
}

export async function refreshLogin() {
  const refreshToken = uni.getStorageSync(REFRESH_KEY);
  if (typeof refreshToken !== 'string' || !refreshToken) return null;
  const result = await createMiniApiClient({ apiBaseUrl: apiBase(), authorization: undefined }).post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken });
  uni.setStorageSync(ACCESS_KEY, result.accessToken);
  return result;
}

export async function signOut() {
  const refreshToken = uni.getStorageSync(REFRESH_KEY);
  if (typeof refreshToken === 'string' && refreshToken) {
    await createMiniApiClient({ apiBaseUrl: apiBase(), authorization: accessToken() }).post('/auth/logout', { refreshToken });
  }
  uni.removeStorageSync(ACCESS_KEY); uni.removeStorageSync(REFRESH_KEY); uni.removeStorageSync(USER_KEY);
}

function apiBase() {
  return (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_MINI_API_BASE_URL || 'http://127.0.0.1:3000/api/v1';
}

function normalizeEmail(value: string) { return value.trim().toLowerCase(); }

function persistAuth(result: { accessToken: string; refreshToken: string; userId: string }) {
  uni.setStorageSync(ACCESS_KEY, result.accessToken);
  uni.setStorageSync(REFRESH_KEY, result.refreshToken);
  uni.setStorageSync(USER_KEY, result.userId);
  migrateGuestPlansToUser(result.userId);
}
