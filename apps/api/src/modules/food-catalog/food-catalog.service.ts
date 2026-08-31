import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service.js';

export interface SearchFoodOptions {
  query?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
  healthLight?: number;
}

export interface SearchFoodResult {
  items: any[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable()
export class FoodCatalogService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  /**
   * 增强的搜索功能
   * - 支持名称搜索
   * - 支持拼音搜索（pinyinCode）
   * - 支持分类筛选
   * - 支持健康等级筛选
   * - 支持分页
   */
  async search(options: SearchFoodOptions = {}): Promise<SearchFoodResult> {
    const {
      query,
      categoryId,
      healthLight,
      page = 1,
      pageSize = 20,
    } = options;

    const q = query?.trim();
    
    // 构建查询条件
    const where: any = {
      isActive: true,
    };

    // 关键词搜索（名称 + 拼音）
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { pinyinCode: { contains: q, mode: 'insensitive' } },
        { aliases: { some: { alias: { contains: q, mode: 'insensitive' } } } },
      ];
    }

    // 分类筛选
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // 健康等级筛选
    if (healthLight !== undefined) {
      where.healthLight = healthLight;
    }

    // 先按目录排序取轻量索引，再按标准名称去重。食物 SQL 中同一基础
    // 食物常有多个重复导入行，这里保证分页不会把重复项拆散到各页。
    const indexed = await this.prisma.foodItem.findMany({
      where,
      select: { id: true, name: true },
      orderBy: [
        { catalogRank: 'desc' }, // 基础食材和无品牌名称优先
        { healthLight: 'asc' },
        { name: 'asc' },
      ],
    });
    const seenNames = new Set<string>();
    const uniqueIds = indexed.filter((item) => {
      const key = item.name.trim().replace(/\s+/gu, '');
      if (seenNames.has(key)) return false;
      seenNames.add(key);
      return true;
    }).map((item) => item.id);
    const total = uniqueIds.length;
    const pageIds = uniqueIds.slice((page - 1) * pageSize, page * pageSize);
    const loaded = await this.prisma.foodItem.findMany({
      where: { id: { in: pageIds } },
      include: { category: true, nutrition: true, servings: true },
    });
    const byId = new Map(loaded.map((item) => [item.id, item]));
    const items = pageIds.map((id) => byId.get(id)).filter(Boolean);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取食物详情
   */
  async getById(foodId: string) {
    const item = await this.prisma.foodItem.findFirst({
      where: { id: foodId, isActive: true },
      include: {
        category: true,
        nutrition: true,
        servings: true,
        aliases: true,
      },
    });
    if (!item || !item.nutrition) {
      throw new NotFoundException('食物不存在或暂未完善');
    }
    return item;
  }

  /**
   * 获取所有分类
   */
  async getCategories() {
    return this.prisma.foodCategory.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * 获取分类下的食物数量
   */
  async getCategoryStats() {
    const categories = await this.prisma.foodCategory.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    const stats = await Promise.all(
      categories.map(async (cat) => {
        const count = await this.prisma.foodItem.count({
          where: {
            categoryId: cat.id,
            isActive: true,
          },
        });
        return {
          ...cat,
          count,
        };
      })
    );

    return stats;
  }

  /**
   * 获取热门食物（按使用频率）
   */
  async getPopularFoods(limit = 10) {
    // TODO: 可以根据 MealEntry 统计使用频率
    // 目前返回健康等级高的食物
    return this.prisma.foodItem.findMany({
      where: {
        isActive: true,
        healthLight: 1, // 绿灯食物
      },
      include: {
        category: true,
        nutrition: true,
        servings: true,
      },
      orderBy: { name: 'asc' },
      take: limit,
    });
  }

  /**
   * 获取推荐食物（基于健康等级和营养）
   */
  async getRecommendedFoods(limit = 10) {
    return this.prisma.foodItem.findMany({
      where: {
        isActive: true,
        healthLight: 1,
        nutrition: {
          proteinG: { gte: 10 }, // 蛋白质 >= 10g
        },
      },
      include: {
        category: true,
        nutrition: true,
        servings: true,
      },
      orderBy: { name: 'asc' },
      take: limit,
    });
  }
}
