import { Controller, Get, Inject, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ValidatedQuery } from '../../common/http/validated-request.js';
import type { AuthenticatedUser } from '../auth/auth-context.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { WeeklyInsightsQueryDto } from './health-insights.dto.js';
import { HealthInsightsService } from './health-insights.service.js';

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

@Controller('health-insights')
@UseGuards(AuthGuard)
export class HealthInsightsController {
  constructor(@Inject(HealthInsightsService) private readonly insights: HealthInsightsService) {}

  @Get('weekly')
  async getWeekly(
    @Req() request: AuthenticatedRequest,
    @ValidatedQuery(WeeklyInsightsQueryDto) query: WeeklyInsightsQueryDto,
    @Res() response: Response,
  ) {
    return response.send({
      data: await this.insights.getWeeklyForUser(request.user.id, query.date),
      meta: { requestId: response.locals.requestId },
    });
  }
}
