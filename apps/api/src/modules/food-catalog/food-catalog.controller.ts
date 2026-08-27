import { Controller, Get, Inject, Param, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ValidatedQuery } from '../../common/http/validated-request.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { FoodCatalogService } from './food-catalog.service.js';
import { SearchFoodsQueryDto } from './food-catalog.dto.js';

@Controller('foods')
@UseGuards(AuthGuard)
export class FoodCatalogController {
  constructor(@Inject(FoodCatalogService) private readonly foods: FoodCatalogService) {}

  @Get('search')
  async search(
    @ValidatedQuery(SearchFoodsQueryDto) query: SearchFoodsQueryDto,
    @Res() response: Response,
  ) {
    return response.send(envelope(await this.foods.search(query.q), response));
  }

  @Get(':foodId')
  async get(@Param('foodId') foodId: string, @Res() response: Response) {
    return response.send(envelope(await this.foods.getById(foodId), response));
  }
}

function envelope<T>(data: T, response: Response) {
  return { data, meta: { requestId: response.locals.requestId } };
}
