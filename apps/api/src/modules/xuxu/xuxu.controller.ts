import { Controller, Inject, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ValidatedBody } from '../../common/http/validated-request.js';
import type { AuthenticatedUser } from '../auth/auth-context.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { XuxuChatDto } from './xuxu.dto.js';
import { XuxuService } from './xuxu.service.js';

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

@Controller('xuxu')
@UseGuards(AuthGuard)
export class XuxuController {
  constructor(@Inject(XuxuService) private readonly xuxu: XuxuService) {}

  @Post('chat')
  async chat(
    @Req() request: AuthenticatedRequest,
    @ValidatedBody(XuxuChatDto) body: XuxuChatDto,
    @Res() response: Response,
  ) {
    return response.send({
      data: await this.xuxu.chat(request.user.id, body),
      meta: { requestId: response.locals.requestId },
    });
  }
}
