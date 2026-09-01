import { describe, expect, it, vi } from 'vitest';
import { CloudBaseAiClient, CloudBaseAiError } from './cloudbase-ai.client.js';

describe('CloudBaseAiClient', () => {
  it('sends the configured model and bearer key to the gateway', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({ choices: [{ message: { content: '你好，今天也照顾好自己。' } }] }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        },
      ),
    );
    const client = new CloudBaseAiClient({
      baseUrl: 'https://env.api.tcloudbasegateway.com/v1/ai/cloudbase/',
      apiKey: 'secret',
      textModel: 'hy3',
      fetcher,
    });
    await expect(client.generateText([{ role: 'user', content: '你好' }])).resolves.toContain(
      '照顾',
    );
    expect(fetcher).toHaveBeenCalledWith(
      'https://env.api.tcloudbasegateway.com/v1/ai/cloudbase/chat/completions',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer secret' }),
        body: expect.stringContaining('"model":"hy3"'),
      }),
    );
  });

  it('does not expose provider response details for an upstream failure', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(JSON.stringify({ error: { code: 'BAD_KEY', message: 'secret key value' } }), {
          status: 401,
        }),
      );
    const client = new CloudBaseAiClient({
      baseUrl: 'https://env.test',
      apiKey: 'secret',
      fetcher,
    });
    await expect(client.generateText([{ role: 'user', content: 'x' }])).rejects.toMatchObject({
      status: 401,
    });
    await expect(client.generateText([{ role: 'user', content: 'x' }])).rejects.not.toThrow(
      'secret key value',
    );
  });

  it('uses the CloudBase SDK adapter for growth-plan credentials', async () => {
    const sdkInvoker = vi.fn().mockResolvedValue('来自成长计划模型');
    const client = new CloudBaseAiClient({
      auth: {
        mode: 'cloudbase-sdk',
        envId: 'tl-d2ghzbl1p09ccaae3',
        secretId: 'AKIDexample',
        secretKey: 'secret-example',
      },
      sdkInvoker,
      textModel: 'hy3',
    });

    await expect(client.generateText([{ role: 'user', content: '你好' }])).resolves.toBe(
      '来自成长计划模型',
    );
    expect(sdkInvoker).toHaveBeenCalledWith({
      model: 'hy3',
      messages: [{ role: 'user', content: '你好' }],
      auth: {
        mode: 'cloudbase-sdk',
        envId: 'tl-d2ghzbl1p09ccaae3',
        secretId: 'AKIDexample',
        secretKey: 'secret-example',
      },
    });
  });

  it('fails clearly when credentials are missing', async () => {
    const client = new CloudBaseAiClient({ fetcher: vi.fn() as typeof fetch });
    await expect(client.generateText([{ role: 'user', content: 'x' }])).rejects.toBeInstanceOf(
      CloudBaseAiError,
    );
  });
});
