import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service.js';

@Injectable()
export class FoodCatalogService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async search(query?: string) {
    const q = query?.trim();
    return this.prisma.foodItem.findMany({
      where: {
        isActive: true,
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { aliases: { some: { alias: { contains: q, mode: 'insensitive' } } } },
              ],
            }
          : {}),
      },
      include: { category: true, nutrition: true, servings: true },
      orderBy: { name: 'asc' },
      take: 30,
    });
  }

  async getById(foodId: string) {
    const item = await this.prisma.foodItem.findFirst({
      where: { id: foodId, isActive: true },
      include: { category: true, nutrition: true, servings: true },
    });
    if (!item || !item.nutrition) throw new NotFoundException('椋熺墿涓嶅瓨鍦ㄦ垨鏆傛湭瀹屽杽');
    return item;
  }
}
