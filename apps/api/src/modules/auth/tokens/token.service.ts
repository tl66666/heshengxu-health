import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../common/database/prisma.service.js';

type AccessPayload = { sub: string; sid: string; exp: number; typ: 'access' };

@Injectable()
export class TokenService {
  private readonly secret = process.env.AUTH_TOKEN_SECRET || 'dev-only-change-me';
  constructor(private readonly prisma: PrismaService) {
    if (process.env.NODE_ENV === 'production' && !process.env.AUTH_TOKEN_SECRET) {
      throw new Error('AUTH_TOKEN_SECRET is required in production');
    }
  }

  async issue(userId: string, deviceLabel?: string) {
    const sessionId = randomBytes(18).toString('hex');
    const refreshToken = `${sessionId}.${randomBytes(32).toString('base64url')}`;
    const refreshHash = this.hash(refreshToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await this.prisma.authSession.create({ data: { id: sessionId, userId, refreshHash, expiresAt, deviceLabel } });
    return { accessToken: this.sign({ sub: userId, sid: sessionId, exp: Date.now() + 1000 * 60 * 15, typ: 'access' }), refreshToken, expiresIn: 900 };
  }

  verifyAccess(token: string) {
    const [encoded, signature] = token.split('.');
    if (!encoded || !signature) throw new UnauthorizedException('登录状态无效');
    const expected = createHmac('sha256', this.secret).update(encoded).digest('base64url');
    if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw new UnauthorizedException('登录状态无效');
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString()) as AccessPayload;
    if (payload.typ !== 'access' || payload.exp < Date.now()) throw new UnauthorizedException('登录已过期');
    return payload;
  }

  async refresh(refreshToken: string) {
    const session = await this.prisma.authSession.findUnique({ where: { refreshHash: this.hash(refreshToken) } });
    if (!session || session.revokedAt || session.expiresAt.getTime() < Date.now()) throw new UnauthorizedException('刷新令牌已失效');
    await this.prisma.authSession.update({ where: { id: session.id }, data: { lastUsedAt: new Date() } });
    return { accessToken: this.sign({ sub: session.userId, sid: session.id, exp: Date.now() + 1000 * 60 * 15, typ: 'access' }), refreshToken, expiresIn: 900 };
  }

  async revoke(refreshToken: string) {
    await this.prisma.authSession.updateMany({ where: { refreshHash: this.hash(refreshToken), revokedAt: null }, data: { revokedAt: new Date() } });
  }

  private sign(payload: AccessPayload) {
    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = createHmac('sha256', this.secret).update(encoded).digest('base64url');
    return `${encoded}.${signature}`;
  }

  private hash(value: string) { return createHash('sha256').update(value).digest('hex'); }
}
