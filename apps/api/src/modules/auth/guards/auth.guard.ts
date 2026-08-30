import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../auth-context.js';
import { TokenService } from '../tokens/token.service.js';

type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly tokens: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = request.header('authorization')?.replace(/^Bearer\s+/iu, '');
    if (!token) throw new UnauthorizedException('登录后访问');
    if (token.startsWith('dev-') && process.env.NODE_ENV !== 'production') {
      request.user = { id: token.slice(4), isDevelopmentToken: true };
      return true;
    }
    const payload = this.tokens.verifyAccess(token);
    request.user = { id: payload.sub, isDevelopmentToken: false };
    return true;
  }
}
