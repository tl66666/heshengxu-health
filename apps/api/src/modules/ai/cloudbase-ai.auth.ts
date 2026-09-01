export type CloudBaseAiAuth =
  | { mode: 'cloudbase-sdk'; envId: string; secretId: string; secretKey: string }
  | { mode: 'gateway'; apiKey: string };

type Environment = Record<string, string | undefined>;

export function resolveCloudBaseAiAuth(environment: Environment = process.env): CloudBaseAiAuth {
  const envId = environment.CLOUDBASE_ENV_ID?.trim();
  const secretId = environment.TENCENTCLOUD_SECRET_ID?.trim();
  const secretKey = environment.TENCENTCLOUD_SECRET_KEY?.trim();
  if (envId && secretId && secretKey) {
    return { mode: 'cloudbase-sdk', envId, secretId, secretKey };
  }

  const apiKey = environment.CLOUDBASE_AI_API_KEY?.trim();
  const baseUrl = environment.CLOUDBASE_AI_BASE_URL?.trim();
  if (apiKey && baseUrl) return { mode: 'gateway', apiKey };

  throw new Error('Configure CloudBase SDK credentials or a CloudBase AI Gateway API key');
}
