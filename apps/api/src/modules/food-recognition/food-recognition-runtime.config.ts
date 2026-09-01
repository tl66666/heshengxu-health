export type FoodRecognitionRuntimeConfig = {
  storageProvider: 'mock' | 'cloudbase';
  visionProvider: 'mock' | 'hunyuan';
};

type RuntimeEnvironment = Record<string, string | undefined>;

export function resolveFoodRecognitionRuntimeConfig(
  environment: RuntimeEnvironment = process.env,
): FoodRecognitionRuntimeConfig {
  const storageProvider = readProvider(
    environment.FOOD_RECOGNITION_STORAGE_PROVIDER,
    'FOOD_RECOGNITION_STORAGE_PROVIDER',
    ['mock', 'cloudbase'],
  );
  const visionProvider = readProvider(
    environment.FOOD_RECOGNITION_VISION_PROVIDER,
    'FOOD_RECOGNITION_VISION_PROVIDER',
    ['mock', 'hunyuan'],
  );

  if (storageProvider === 'cloudbase') {
    assertRequired(
      environment,
      ['CLOUDBASE_ENV_ID', 'TENCENTCLOUD_SECRET_ID', 'TENCENTCLOUD_SECRET_KEY'],
      'CloudBase food-recognition storage',
    );
  }
  if (visionProvider === 'hunyuan') {
    const hasSdkCredentials = [
      environment.CLOUDBASE_ENV_ID,
      environment.TENCENTCLOUD_SECRET_ID,
      environment.TENCENTCLOUD_SECRET_KEY,
    ].every((value) => Boolean(value?.trim()));
    const hasGatewayCredentials = [
      environment.CLOUDBASE_AI_BASE_URL,
      environment.CLOUDBASE_AI_API_KEY,
    ].every((value) => Boolean(value?.trim()));
    if (!hasSdkCredentials && !hasGatewayCredentials) {
      throw new Error(
        'CloudBase AI food recognition requires CLOUDBASE_ENV_ID, TENCENTCLOUD_SECRET_ID, TENCENTCLOUD_SECRET_KEY or CLOUDBASE_AI_BASE_URL, CLOUDBASE_AI_API_KEY',
      );
    }
  }

  return { storageProvider, visionProvider };
}

function readProvider<T extends string>(
  value: string | undefined,
  variableName: string,
  allowed: readonly T[],
): T {
  const selected = value?.trim() || 'mock';
  if (!allowed.includes(selected as T)) {
    throw new Error(`${variableName} must be one of: ${allowed.join(', ')}`);
  }
  return selected as T;
}

function assertRequired(environment: RuntimeEnvironment, names: string[], integration: string) {
  const missing = names.filter((name) => !environment[name]?.trim());
  if (missing.length > 0) {
    throw new Error(`${integration} requires: ${missing.join(', ')}`);
  }
}
