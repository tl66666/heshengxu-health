import { describe, expect, it } from 'vitest';
import { resolveCloudBaseAiAuth } from './cloudbase-ai.auth.js';

describe('resolveCloudBaseAiAuth', () => {
  it('selects CloudBase SDK credentials for the growth plan', () => {
    expect(
      resolveCloudBaseAiAuth({
        CLOUDBASE_ENV_ID: 'tl-d2ghzbl1p09ccaae3',
        TENCENTCLOUD_SECRET_ID: 'AKIDexample',
        TENCENTCLOUD_SECRET_KEY: 'secret-example',
      }),
    ).toEqual({
      mode: 'cloudbase-sdk',
      envId: 'tl-d2ghzbl1p09ccaae3',
      secretId: 'AKIDexample',
      secretKey: 'secret-example',
    });
  });

  it('selects Gateway credentials only when a CloudBase API key is configured', () => {
    expect(
      resolveCloudBaseAiAuth({
        CLOUDBASE_AI_BASE_URL: 'https://example.api.tcloudbasegateway.com/v1/ai/cloudbase',
        CLOUDBASE_AI_API_KEY: 'cloudbase-key',
      }),
    ).toEqual({ mode: 'gateway', apiKey: 'cloudbase-key' });
  });

  it('fails with an actionable error when no supported credentials are configured', () => {
    expect(() => resolveCloudBaseAiAuth({})).toThrow(
      'Configure CloudBase SDK credentials or a CloudBase AI Gateway API key',
    );
  });
});
