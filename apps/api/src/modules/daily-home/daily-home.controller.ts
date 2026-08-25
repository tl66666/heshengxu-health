import { Controller, Get, Inject, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ValidatedQuery } from '../../common/http/validated-request.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import type { AuthenticatedUser } from '../auth/auth-context.js';
import { TodayRecordsQueryDto } from '../health-records/health-records.dto.js';
import { DailyHomeService } from './daily-home.service.js';

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

@Controller('daily-home')
@UseGuards(AuthGuard)
export class DailyHomeController {
  constructor(@Inject(DailyHomeService) private readonly dailyHome: DailyHomeService) {}

  @Get('today')
  async getToday(
    @Req() request: AuthenticatedRequest,
    @ValidatedQuery(TodayRecordsQueryDto) query: TodayRecordsQueryDto,
    @Res() response: Response,
  ) {
    return response.send({
      data: await this.dailyHome.getToday(request.user.id, query.date),
      meta: { requestId: response.locals.requestId },
    });
  }
}
