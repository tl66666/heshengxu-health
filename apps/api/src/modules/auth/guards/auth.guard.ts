import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../auth-context.js';

type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = request.header('authorization')?.replace(/^Bearer\s+/iu, '');
    if (!token?.startsWith('dev-') || process.env.NODE_ENV === 'production') {
      throw new UnauthorizedException('需要登录后访问');
    }

    request.user = { id: token.slice(4), isDevelopmentToken: true };
    return true;
  }
}
