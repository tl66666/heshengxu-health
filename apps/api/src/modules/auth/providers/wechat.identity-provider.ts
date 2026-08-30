import type { IdentityProvider } from './identity-provider.js';

export class WechatIdentityProvider implements IdentityProvider {
  constructor(
    private readonly appId = process.env.WECHAT_APP_ID,
    private readonly appSecret = process.env.WECHAT_APP_SECRET,
  ) {
    if (!appId || !appSecret) {
      throw new Error('WECHAT_APP_ID and WECHAT_APP_SECRET are required for WeChat login');
    }
  }

  async exchange(code: string): Promise<{ provider: 'wechat'; providerUserId: string }> {
    if (!code.trim()) throw new Error('WECHAT_CODE_REQUIRED');
    const url = new URL('https://api.weixin.qq.com/sns/jscode2session');
    url.searchParams.set('appid', this.appId!);
    url.searchParams.set('secret', this.appSecret!);
    url.searchParams.set('js_code', code);
    url.searchParams.set('grant_type', 'authorization_code');
    const response = await fetch(url);
    if (!response.ok) throw new Error('WECHAT_EXCHANGE_FAILED');
    const body = (await response.json()) as { openid?: string; errcode?: number };
    if (!body.openid) throw new Error(`WECHAT_EXCHANGE_${body.errcode ?? 'UNKNOWN'}`);
    return { provider: 'wechat', providerUserId: body.openid };
  }
}
