export type MiniRuntime = {
  apiBaseUrl: string;
  authorization?: string;
};

type MiniRuntimeEnvironment = Record<string, string | undefined>;

export function resolveMiniRuntime(environment: MiniRuntimeEnvironment): MiniRuntime {
  const configuredBaseUrl = environment.VITE_MINI_API_BASE_URL?.trim();
  if (configuredBaseUrl) {
    const token = typeof uni !== 'undefined' ? uni.getStorageSync('heban.auth.access-token') : undefined;
    return { apiBaseUrl: configuredBaseUrl.replace(/\/$/u, ''), authorization: typeof token === 'string' ? `Bearer ${token}` : undefined };
  }

  return {
    apiBaseUrl: 'http://127.0.0.1:3000/api/v1',
    authorization: 'Bearer dev-mini-user',
  };
}
