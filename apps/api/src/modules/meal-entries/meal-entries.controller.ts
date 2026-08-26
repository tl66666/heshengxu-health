import { Controller, Get, Inject, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ValidatedBody, ValidatedQuery } from '../../common/http/validated-request.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import type { AuthenticatedUser } from '../auth/auth-context.js';
import { CreateMealEntryDto } from './meal-entries.dto.js';
import { MealEntriesService } from './meal-entries.service.js';
import { MealEntriesQueryDto } from './meal-entries.dto.js';

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

@Controller('meal-entries')
@UseGuards(AuthGuard)
export class MealEntriesController {
  constructor(@Inject(MealEntriesService) private readonly entries: MealEntriesService) {}

  @Post()
  async create(
    @Req() request: AuthenticatedRequest,
    @ValidatedBody(CreateMealEntryDto) body: CreateMealEntryDto,
    @Res() response: Response,
  ) {
    return response.status(201).send({
      data: await this.entries.create(request.user.id, body),
      meta: { requestId: response.locals.requestId },
    });
  }

  @Get()
  async list(
    @Req() request: AuthenticatedRequest,
    @ValidatedQuery(MealEntriesQueryDto) query: MealEntriesQueryDto,
    @Res() response: Response,
  ) {
    return response.send({
      data: await this.entries.listForDate(request.user.id, query.date),
      meta: { requestId: response.locals.requestId },
    });
  }
}
