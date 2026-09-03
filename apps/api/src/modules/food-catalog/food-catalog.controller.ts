import { Controller, Get, Inject, Param, Res, UseGuards, Query } from '@nestjs/common';
import type { Response } from 'express';
import { ValidatedQuery } from '../../common/http/validated-request.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { FoodCatalogService } from './food-catalog.service.js';
import { SearchFoodsQueryDto } from './food-catalog.dto.js';

@Controller('foods')
@UseGuards(AuthGuard)
export class FoodCatalogController {
  constructor(@Inject(FoodCatalogService) private readonly foods: FoodCatalogService) {}

  /**
   * 搜索食物
   * GET /foods/search?q=米饭&categoryId=xxx&page=1&pageSize=20&healthLight=1
   */
  @Get('search')
  async search(
    @Res() response: Response,
    @Query('q') q?: string,
    @Query('categoryId') categoryId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('healthLight') healthLight?: string,
  ) {
    const result = await this.foods.search({
      query: q,
      categoryId,
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
      healthLight: healthLight ? parseInt(healthLight) : undefined,
    });
    
    return response.send(envelope(result, response));
  }

  /**
   * 获取食物详情
   * GET /foods/:foodId
   */
  @Get(':foodId')
  async get(@Param('foodId') foodId: string, @Res() response: Response) {
    return response.send(envelope(await this.foods.getById(foodId), response));
  }

  /**
   * 获取所有分类
   * GET /foods/categories
   */
  @Get('categories/list')
  async getCategories(@Res() response: Response) {
    return response.send(envelope(await this.foods.getCategories(), response));
  }

  /**
   * 获取分类统计
   * GET /foods/categories/stats
   */
  @Get('categories/stats')
  async getCategoryStats(@Res() response: Response) {
    return response.send(envelope(await this.foods.getCategoryStats(), response));
  }

  /**
   * 获取热门食物
   * GET /foods/popular?limit=10
   */
  @Get('popular/list')
  async getPopular(@Res() response: Response, @Query('limit') limit?: string) {
    const result = await this.foods.getPopularFoods(limit ? parseInt(limit) : 10);
    return response.send(envelope(result, response));
  }

  /**
   * 获取推荐食物
   * GET /foods/recommended?limit=10
   */
  @Get('recommended/list')
  async getRecommended(@Res() response: Response, @Query('limit') limit?: string) {
    const result = await this.foods.getRecommendedFoods(limit ? parseInt(limit) : 10);
    return response.send(envelope(result, response));
  }
}

function envelope<T>(data: T, response: Response) {
  return { data, meta: { requestId: response.locals.requestId } };
}
