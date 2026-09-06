import { ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../../common/database/prisma.service.js';
import { AuthService } from './auth.service.js';
import type { TokenService } from './tokens/token.service.js';

describe('WeChat authentication failures', () => {
  beforeEach(() => {
    vi.stubEnv('WECHAT_APP_ID', 'wx-test-app-id');
    vi.stubEnv('WECHAT_APP_SECRET', 'test-app-secret');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('maps an invalid WeChat AppSecret to a recoverable service error', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ errcode: 40125, errmsg: 'invalid appsecret' }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }),
        ),
    );
    const prisma = {} as PrismaService;
    const tokens = {} as TokenService;
    const service = new AuthService(prisma, tokens);

    await expect(service.loginWithWechat('temporary-code')).rejects.toMatchObject({
      constructor: ServiceUnavailableException,
      response: {
        statusCode: 503,
        message: '微信登录配置已失效，请稍后重试',
      },
    });
  });

  it('asks the mini program to re-authorize when a WeChat code has expired', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ errcode: 40029, errmsg: 'invalid code' }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }),
        ),
    );
    const service = new AuthService({} as PrismaService, {} as TokenService);

    await expect(service.loginWithWechat('expired-code')).rejects.toMatchObject({
      constructor: UnauthorizedException,
      response: {
        statusCode: 401,
        message: '微信登录凭证已失效，请重新授权',
      },
    });
  });
});
