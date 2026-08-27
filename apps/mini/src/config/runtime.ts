export type MiniRuntime = {
  apiBaseUrl: string;
  authorization?: string;
};

type MiniRuntimeEnvironment = Record<string, string | undefined>;

export function resolveMiniRuntime(environment: MiniRuntimeEnvironment): MiniRuntime {
  const configuredBaseUrl = environment.VITE_MINI_API_BASE_URL?.trim();
  if (configuredBaseUrl) {
    return { apiBaseUrl: configuredBaseUrl.replace(/\/$/u, '') };
  }

  return {
    apiBaseUrl: 'http://localhost:3000/api/v1',
    authorization: 'Bearer dev-mini-user',
  };
}
