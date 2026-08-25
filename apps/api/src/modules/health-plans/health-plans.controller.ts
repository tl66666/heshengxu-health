import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import type { AuthenticatedUser } from '../auth/auth-context.js';
import { TodayRecordsQueryDto } from '../health-records/health-records.dto.js';
import { HealthPlansService } from './health-plans.service.js';
import { SaveCurrentPlanDto, UpdatePlanTaskDto } from './health-plans.dto.js';

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

@Controller('health-plans')
@UseGuards(AuthGuard)
export class HealthPlansController {
  constructor(@Inject(HealthPlansService) private readonly plans: HealthPlansService) {}

  @Put('current')
  async saveCurrent(
    @Req() request: AuthenticatedRequest,
    @Body() body: SaveCurrentPlanDto,
    @Res() response: Response,
  ) {
    return response.send(envelope(await this.plans.saveCurrent(request.user.id, body), response));
  }

  @Get('current')
  async getCurrent(
    @Req() request: AuthenticatedRequest,
    @Query() query: TodayRecordsQueryDto,
    @Res() response: Response,
  ) {
    return response.send(
      envelope(await this.plans.getForUser(request.user.id, query.date), response),
    );
  }

  @Patch('tasks/:taskId')
  async completeTask(
    @Req() request: AuthenticatedRequest,
    @Param('taskId') taskId: string,
    @Body() body: UpdatePlanTaskDto,
    @Res() response: Response,
  ) {
    return response.send(
      envelope(await this.plans.completeTask(request.user.id, taskId, body), response),
    );
  }
}

function envelope<T>(data: T, response: Response) {
  return { data, meta: { requestId: response.locals.requestId } };
}
