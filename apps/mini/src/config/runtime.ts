export type MiniRuntime = {
  apiBaseUrl: string;
  authorization?: string;
};

type MiniRuntimeEnvironment = Record<string, string | undefined>;

const PRODUCTION_API_BASE_URL =
  'https://api-heshengxu-prod.yellowsky-5fa044e1.eastasia.azurecontainerapps.io/api/v1';

export function resolveMiniRuntime(environment: MiniRuntimeEnvironment): MiniRuntime {
  const configuredBaseUrl = environment.VITE_MINI_API_BASE_URL?.trim();
  if (configuredBaseUrl) {
    const token = typeof uni !== 'undefined' ? uni.getStorageSync('heban.auth.access-token') : undefined;
    return { apiBaseUrl: configuredBaseUrl.replace(/\/$/u, ''), authorization: typeof token === 'string' ? `Bearer ${token}` : undefined };
  }

  if (environment.UNI_PLATFORM === 'app' || environment.UNI_PLATFORM === 'app-plus') {
    return { apiBaseUrl: PRODUCTION_API_BASE_URL, authorization: undefined };
  }

  return {
    apiBaseUrl: 'http://127.0.0.1:3000/api/v1',
    authorization: 'Bearer dev-mini-user',
  };
}
