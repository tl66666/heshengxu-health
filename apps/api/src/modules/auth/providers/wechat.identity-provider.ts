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
    void code;
    throw new Error('WeChat credential exchange is not enabled during stage 0');
  }
}
