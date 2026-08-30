import { Body, Controller, Inject, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ValidatedBody } from '../../common/http/validated-request.js';
import { AuthService } from './auth.service.js';
import { RefreshTokenDto, WechatLoginDto } from './auth.dto.js';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  @Post('wechat/login')
  async login(@ValidatedBody(WechatLoginDto) body: WechatLoginDto, @Req() request: Request, @Res() response: Response) {
    return response.send({ data: await this.auth.loginWithWechat(body.code, request.header('x-device-label')), meta: { requestId: response.locals.requestId } });
  }

  @Post('refresh')
  async refresh(@ValidatedBody(RefreshTokenDto) body: RefreshTokenDto, @Res() response: Response) {
    return response.send({ data: await this.auth.refresh(body.refreshToken), meta: { requestId: response.locals.requestId } });
  }

  @Post('logout')
  async logout(@ValidatedBody(RefreshTokenDto) body: RefreshTokenDto, @Res() response: Response) {
    await this.auth.logout(body.refreshToken);
    return response.status(204).send();
  }
}
