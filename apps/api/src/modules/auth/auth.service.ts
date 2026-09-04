import {
  ConflictException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { PrismaService } from '../../common/database/prisma.service.js';
import { WechatIdentityProvider } from './providers/wechat.identity-provider.js';
import { TokenService } from './tokens/token.service.js';

const scrypt = promisify(scryptCallback);
const PASSWORD_KEY_LENGTH = 64;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
  ) {}

  async loginWithWechat(code: string, deviceLabel?: string) {
    try {
      const identity = await new WechatIdentityProvider().exchange(code);
      const existing = await this.prisma.externalIdentity.findUnique({
        where: {
          provider_providerUserId: {
            provider: identity.provider,
            providerUserId: identity.providerUserId,
          },
        },
      });
      const user = existing
        ? await this.prisma.user.findUniqueOrThrow({ where: { id: existing.userId } })
        : await this.prisma.user.create({
            data: {
              id: randomUUID(),
              externalIdentities: {
                create: { provider: identity.provider, providerUserId: identity.providerUserId },
              },
            },
          });
      return {
        userId: user.id,
        provider: identity.provider,
        ...(await this.tokens.issue(user.id, deviceLabel)),
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('WECHAT_APP_SECRET'))
        throw new ServiceUnavailableException('服务端尚未配置微信登录密钥');
      throw error;
    }
  }

  refresh(token: string) {
    return this.tokens.refresh(token);
  }
  logout(token: string) {
    return this.tokens.revoke(token);
  }

  async registerWithPassword(email: string, password: string) {
    const normalizedEmail = normalizeEmail(email);
    const existing = await this.prisma.appCredential.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) throw new ConflictException('该邮箱已注册');
    const userId = randomUUID();
    await this.prisma.user.create({ data: { id: userId } });
    await this.prisma.appCredential.create({
      data: { userId, email: normalizedEmail, passwordHash: await hashPassword(password) },
    });
    return { userId, provider: 'app_password' as const };
  }

  async loginWithPassword(email: string, password: string, deviceLabel = 'app') {
    const credential = await this.prisma.appCredential.findUnique({
      where: { email: normalizeEmail(email) },
    });
    if (!credential || !(await verifyPassword(password, credential.passwordHash)))
      throw new UnauthorizedException('账号或密码错误');
    return {
      userId: credential.userId,
      provider: 'app_password' as const,
      ...(await this.tokens.issue(credential.userId, deviceLabel)),
    };
  }
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('base64url');
  const derived = (await scrypt(password, salt, PASSWORD_KEY_LENGTH)) as Buffer;
  return `scrypt$16384$8$1$${salt}$${derived.toString('base64url')}`;
}

async function verifyPassword(password: string, encoded: string) {
  const [algorithm, n, r, p, salt, expected] = encoded.split('$');
  if (algorithm !== 'scrypt' || !n || !r || !p || !salt || !expected) return false;
  if (Number(n) !== 16384 || Number(r) !== 8 || Number(p) !== 1) return false;
  const derived = (await scrypt(password, salt, PASSWORD_KEY_LENGTH)) as Buffer;
  const expectedBuffer = Buffer.from(expected, 'base64url');
  return expectedBuffer.length === derived.length && timingSafeEqual(expectedBuffer, derived);
}
