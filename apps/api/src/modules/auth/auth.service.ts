import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../common/database/prisma.service.js';
import { WechatIdentityProvider } from './providers/wechat.identity-provider.js';
import { TokenService } from './tokens/token.service.js';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly tokens: TokenService) {}

  async loginWithWechat(code: string, deviceLabel?: string) {
    try {
      const identity = await new WechatIdentityProvider().exchange(code);
      const existing = await this.prisma.externalIdentity.findUnique({ where: { provider_providerUserId: { provider: identity.provider, providerUserId: identity.providerUserId } } });
      const user = existing
        ? await this.prisma.user.findUniqueOrThrow({ where: { id: existing.userId } })
        : await this.prisma.user.create({ data: { id: randomUUID(), externalIdentities: { create: { provider: identity.provider, providerUserId: identity.providerUserId } } } });
      return { userId: user.id, provider: identity.provider, ...(await this.tokens.issue(user.id, deviceLabel)) };
    } catch (error) {
      if (error instanceof Error && error.message.includes('WECHAT_APP_SECRET')) throw new ServiceUnavailableException('服务端尚未配置微信登录密钥');
      throw error;
    }
  }

  refresh(token: string) { return this.tokens.refresh(token); }
  logout(token: string) { return this.tokens.revoke(token); }
}
