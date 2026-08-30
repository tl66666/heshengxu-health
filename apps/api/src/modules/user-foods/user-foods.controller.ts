import { Controller, Delete, Get, Inject, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ValidatedBody, ValidatedQuery } from '../../common/http/validated-request.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import type { AuthenticatedUser } from '../auth/auth-context.js';
import { CreateUserFoodDto, UserFoodsQueryDto } from './user-foods.dto.js';
import { UserFoodsService } from './user-foods.service.js';

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

@Controller('user-foods')
@UseGuards(AuthGuard)
export class UserFoodsController {
  constructor(@Inject(UserFoodsService) private readonly foods: UserFoodsService) {}

  @Post()
  async create(
    @Req() request: AuthenticatedRequest,
    @ValidatedBody(CreateUserFoodDto) body: CreateUserFoodDto,
    @Res() response: Response,
  ) {
    return response.status(201).send({
      data: await this.foods.create(request.user.id, body),
      meta: { requestId: response.locals.requestId },
    });
  }

  @Get()
  async list(
    @Req() request: AuthenticatedRequest,
    @ValidatedQuery(UserFoodsQueryDto) query: UserFoodsQueryDto,
    @Res() response: Response,
  ) {
    return response.send({
      data: await this.foods.list(request.user.id, query.q),
      meta: { requestId: response.locals.requestId },
    });
  }

  @Delete(':id')
  async remove(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Res() response: Response,
  ) {
    await this.foods.remove(request.user.id, id);
    return response.status(204).send();
  }
}
