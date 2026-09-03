import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service.js';
import type { CreateUserFoodDto } from './user-foods.dto.js';

@Injectable()
export class UserFoodsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateUserFoodDto) {
    await this.prisma.user.upsert({
      where: { id: userId },
      create: { id: userId },
      update: {},
    });

    return this.prisma.userFood.create({
      data: {
        userId,
        name: dto.name.trim(),
        imageUrl: dto.imageUrl,
        source: dto.source,
        energyKcal: dto.energyKcal,
        proteinG: dto.proteinG,
        fatG: dto.fatG,
        carbohydrateG: dto.carbohydrateG,
        defaultServingLabel: dto.defaultServingLabel.trim(),
        defaultServingGrams: dto.defaultServingGrams,
      },
    });
  }

  list(userId: string, query?: string) {
    const q = query?.trim();
    return this.prisma.userFood.findMany({
      where: {
        userId,
        ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(userId: string, id: string) {
    const food = await this.prisma.userFood.findFirst({ where: { id, userId } });
    if (!food) throw new NotFoundException('未找到该食物');
    await this.prisma.userFood.delete({ where: { id: food.id } });
  }
}
