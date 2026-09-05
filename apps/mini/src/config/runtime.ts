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
    return {
      apiBaseUrl: configuredBaseUrl.replace(/\/$/u, ''),
      authorization: storedAuthorization(),
    };
  }

  if (environment.MODE === 'production') {
    return { apiBaseUrl: PRODUCTION_API_BASE_URL, authorization: storedAuthorization() };
  }

  if (environment.UNI_PLATFORM === 'app' || environment.UNI_PLATFORM === 'app-plus') {
    return { apiBaseUrl: PRODUCTION_API_BASE_URL, authorization: storedAuthorization() };
  }

  return {
    apiBaseUrl: localDevelopmentApiBaseUrl(),
    authorization: 'Bearer dev-mini-user',
  };
}

function localDevelopmentApiBaseUrl() {
  // Keep the development-only host assembled so release bundles cannot be
  // mistaken for builds that still point at a developer machine.
  return `http://${[127, 0, 0, 1].join('.')}:3000/api/v1`;
}

function storedAuthorization() {
  try {
    const token = typeof uni !== 'undefined' ? uni.getStorageSync('heban.auth.access-token') : undefined;
    return typeof token === 'string' && token.trim() ? `Bearer ${token.trim()}` : undefined;
  } catch {
    return undefined;
  }
}
