import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ValidatedBody, ValidatedQuery } from '../../common/http/validated-request.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import type { AuthenticatedUser } from '../auth/auth-context.js';
import {
  CreateActivityRecordDto,
  CreateMealStructureRecordDto,
  CreateSleepRecordDto,
  CreateWeightRecordDto,
  ReplaceHealthRecordDto,
  TodayRecordsQueryDto,
} from './health-records.dto.js';
import { HealthRecordsService, type HealthRecordType } from './health-records.service.js';

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

@Controller('health-records')
@UseGuards(AuthGuard)
export class HealthRecordsController {
  constructor(@Inject(HealthRecordsService) private readonly records: HealthRecordsService) {}

  @Post('weights')
  async createWeight(
    @Req() request: AuthenticatedRequest,
    @ValidatedBody(CreateWeightRecordDto) body: CreateWeightRecordDto,
    @Res() response: Response,
  ) {
    return response
      .status(201)
      .send(envelope(await this.records.createWeight(request.user.id, body), response));
  }

  @Post('meal-structures')
  async createMeal(
    @Req() request: AuthenticatedRequest,
    @ValidatedBody(CreateMealStructureRecordDto) body: CreateMealStructureRecordDto,
    @Res() response: Response,
  ) {
    return response
      .status(201)
      .send(envelope(await this.records.createMealStructure(request.user.id, body), response));
  }

  @Post('activities')
  async createActivity(
    @Req() request: AuthenticatedRequest,
    @ValidatedBody(CreateActivityRecordDto) body: CreateActivityRecordDto,
    @Res() response: Response,
  ) {
    return response
      .status(201)
      .send(envelope(await this.records.createActivity(request.user.id, body), response));
  }

  @Post('sleeps')
  async createSleep(
    @Req() request: AuthenticatedRequest,
    @ValidatedBody(CreateSleepRecordDto) body: CreateSleepRecordDto,
    @Res() response: Response,
  ) {
    return response
      .status(201)
      .send(envelope(await this.records.createSleep(request.user.id, body), response));
  }

  @Patch(':recordType/:recordId')
  async replace(
    @Req() request: AuthenticatedRequest,
    @Param('recordType') recordType: HealthRecordType,
    @Param('recordId') recordId: string,
    @ValidatedBody(ReplaceHealthRecordDto) body: ReplaceHealthRecordDto,
    @Res() response: Response,
  ) {
    if (!isRecordType(recordType)) throw new NotFoundException('未找到该记录类型');
    return response.send(
      envelope(await this.records.replace(request.user.id, recordType, recordId, body), response),
    );
  }

  @Get('today')
  async getToday(
    @Req() request: AuthenticatedRequest,
    @ValidatedQuery(TodayRecordsQueryDto) query: TodayRecordsQueryDto,
    @Res() response: Response,
  ) {
    return response.send(
      envelope(await this.records.getTodayForUser(request.user.id, query.date), response),
    );
  }
}

function envelope<T>(data: T, response: Response) {
  return { data, meta: { requestId: response.locals.requestId } };
}

function isRecordType(value: string): value is HealthRecordType {
  return (
    value === 'weight' || value === 'meal-structure' || value === 'activity' || value === 'sleep'
  );
}
