export type CloudBaseChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content:
    | string
    | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>;
};

export type CloudBaseAiClientOptions = {
  baseUrl?: string;
  apiKey?: string;
  textModel?: string;
  visionModel?: string;
  fetcher?: typeof fetch;
  auth?: CloudBaseAiAuth;
  visionAuth?: CloudBaseAiAuth;
  sdkInvoker?: (input: {
    model: string;
    messages: CloudBaseChatMessage[];
    auth: Extract<CloudBaseAiAuth, { mode: 'cloudbase-sdk' }>;
  }) => Promise<string>;
};

export class CloudBaseAiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'CloudBaseAiError';
  }
}

export class CloudBaseAiClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  readonly textModel: string;
  readonly visionModel: string;
  private readonly fetcher: typeof fetch;
  private readonly auth?: CloudBaseAiAuth;
  private readonly visionAuth?: CloudBaseAiAuth;
  private readonly sdkInvoker?: CloudBaseAiClientOptions['sdkInvoker'];

  constructor(options: CloudBaseAiClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? process.env.CLOUDBASE_AI_BASE_URL ?? '').replace(
      /\/+$/u,
      '',
    );
    this.apiKey = options.apiKey ?? process.env.CLOUDBASE_AI_API_KEY ?? '';
    this.textModel = options.textModel ?? process.env.CLOUDBASE_AI_TEXT_MODEL ?? 'hy3';
    this.visionModel =
      options.visionModel ?? process.env.CLOUDBASE_AI_VISION_MODEL ?? 'glm-5v-turbo';
    const visionBaseUrl =
      process.env.CLOUDBASE_AI_VISION_BASE_URL ??
      (this.visionModel.startsWith('glm-') ? 'https://open.bigmodel.cn/api/paas/v4' : this.baseUrl);
    const visionApiKey = process.env.CLOUDBASE_AI_VISION_API_KEY ?? this.apiKey;
    this.fetcher = options.fetcher ?? fetch;
    try {
      this.auth =
        options.auth ??
        resolveCloudBaseAiAuth({
          CLOUDBASE_ENV_ID: process.env.CLOUDBASE_ENV_ID,
          TENCENTCLOUD_SECRET_ID: process.env.TENCENTCLOUD_SECRET_ID,
          TENCENTCLOUD_SECRET_KEY: process.env.TENCENTCLOUD_SECRET_KEY,
          CLOUDBASE_AI_BASE_URL: this.baseUrl,
          CLOUDBASE_AI_API_KEY: this.apiKey,
        });
    } catch {
      this.auth = undefined;
    }
    try {
      this.visionAuth =
        options.visionAuth ??
        resolveCloudBaseAiAuth({
          CLOUDBASE_AI_BASE_URL: visionBaseUrl,
          CLOUDBASE_AI_API_KEY: visionApiKey,
        });
    } catch {
      this.visionAuth = undefined;
    }
    this.sdkInvoker = options.sdkInvoker;
  }

  isConfigured() {
    return Boolean(this.auth);
  }

  async generateText(messages: CloudBaseChatMessage[]) {
    if (this.auth?.mode === 'cloudbase-sdk') {
      return this.invokeSdk({ model: this.textModel, messages });
    }
    const body = await this.request({ model: this.textModel, messages });
    return extractText(body);
  }

  async analyzeImage(input: { dataUrl: string; prompt: string }) {
    if (this.visionAuth?.mode === 'cloudbase-sdk') {
      return this.invokeSdk({
        model: this.visionModel,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: input.prompt },
              { type: 'image_url', image_url: { url: input.dataUrl } },
            ],
          },
        ],
      });
    }
    if (this.visionAuth?.mode !== 'gateway') {
      throw new CloudBaseAiError(
        'Food image recognition requires a CloudBase Gateway vision key',
        503,
        'VISION_NOT_CONFIGURED',
      );
    }
    const body = await this.request(
      {
        model: this.visionModel,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: input.prompt },
              { type: 'image_url', image_url: { url: input.dataUrl } },
            ],
          },
        ],
      },
      {
        baseUrl:
          process.env.CLOUDBASE_AI_VISION_BASE_URL ??
          (this.visionModel.startsWith('glm-')
            ? 'https://open.bigmodel.cn/api/paas/v4'
            : this.baseUrl),
        apiKey: process.env.CLOUDBASE_AI_VISION_API_KEY ?? this.apiKey,
        auth: this.visionAuth,
      },
    );
    return extractText(body);
  }

  private async request(
    body: { model: string; messages: CloudBaseChatMessage[] },
    config: { baseUrl?: string; apiKey?: string; auth?: CloudBaseAiAuth } = {},
  ) {
    const baseUrl = config.baseUrl ?? this.baseUrl;
    const apiKey = config.apiKey ?? this.apiKey;
    if (!this.isConfigured()) throw new CloudBaseAiError('CloudBase AI 未配置');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30_000);
    try {
      const response = await this.fetcher(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...body, temperature: 0.2 }),
        signal: controller.signal,
      });
      const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
      if (!response.ok) {
        const error = payload?.error as Record<string, unknown> | undefined;
        throw new CloudBaseAiError(
          typeof error?.message === 'string'
            ? error.message
            : `CloudBase AI 请求失败（${response.status}）`,
          response.status,
          typeof error?.code === 'string' ? error.code : undefined,
        );
      }
      return payload ?? {};
    } catch (error) {
      if (error instanceof CloudBaseAiError) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        throw new CloudBaseAiError('CloudBase AI 请求超时', 408, 'TIMEOUT');
      }
      throw new CloudBaseAiError('CloudBase AI 网络请求失败', 503, 'NETWORK_ERROR');
    } finally {
      clearTimeout(timer);
    }
  }

  private async invokeSdk(input: { model: string; messages: CloudBaseChatMessage[] }) {
    if (this.auth?.mode !== 'cloudbase-sdk') throw new CloudBaseAiError('Invalid AI auth mode');
    if (this.sdkInvoker) return this.sdkInvoker({ ...input, auth: this.auth });
    try {
      const sdk = await loadCloudBaseSdk();
      const app = sdk.init({
        env: this.auth.envId,
        secretId: this.auth.secretId,
        secretKey: this.auth.secretKey,
        timeout: 60_000,
      });
      const result = await app
        .ai()
        .createModel('cloudbase')
        .generateText({
          model: input.model,
          messages: input.messages as never,
          temperature: 0.2,
        });
      if (typeof result?.text === 'string' && result.text.trim()) return result.text;
      throw new CloudBaseAiError('CloudBase AI 返回内容为空', 502, 'EMPTY_RESPONSE');
    } catch (error) {
      if (error instanceof CloudBaseAiError) throw error;
      throw new CloudBaseAiError('CloudBase SDK 请求失败', 503, 'SDK_ERROR');
    }
  }
}

type CloudBaseSdkModule = {
  init: (config: { env: string; secretId: string; secretKey: string; timeout: number }) => {
    ai: () => {
      createModel: (provider: string) => {
        generateText: (input: {
          model: string;
          messages: unknown[];
          temperature: number;
        }) => Promise<{ text?: string }>;
      };
    };
  };
};

async function loadCloudBaseSdk(): Promise<CloudBaseSdkModule> {
  const dynamicImport = new Function('specifier', 'return import(specifier)') as (
    specifier: string,
  ) => Promise<CloudBaseSdkModule>;
  return dynamicImport('@cloudbase/node-sdk');
}

function extractText(payload: Record<string, unknown>) {
  const choices = Array.isArray(payload.choices) ? payload.choices : [];
  const first = choices[0] as Record<string, unknown> | undefined;
  const message = first?.message as Record<string, unknown> | undefined;
  if (typeof message?.content === 'string') return message.content;
  if (typeof first?.text === 'string') return first.text;
  throw new CloudBaseAiError('CloudBase AI 返回内容为空', 502, 'EMPTY_RESPONSE');
}
import { resolveCloudBaseAiAuth, type CloudBaseAiAuth } from './cloudbase-ai.auth.js';
