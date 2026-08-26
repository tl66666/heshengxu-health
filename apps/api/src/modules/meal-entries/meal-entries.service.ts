import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { calculateNutritionForGrams } from '@heban/domain';
import { PrismaService } from '../../common/database/prisma.service.js';
import type { CreateMealEntryDto } from './meal-entries.dto.js';

@Injectable()
export class MealEntriesService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateMealEntryDto) {
    const food = await this.prisma.foodItem.findFirst({
      where: { id: dto.foodId, isActive: true },
      include: { nutrition: true },
    });
    if (!food?.nutrition) throw new NotFoundException('椋熺墿涓嶅瓨鍦ㄦ垨鏆傛湭瀹屽杽');
    const nutrition = calculateNutritionForGrams(food.nutrition, dto.grams);
    await this.prisma.user.upsert({ where: { id: userId }, create: { id: userId }, update: {} });
    return this.prisma.mealEntry.create({
      data: {
        userId,
        mealType: dto.mealType,
        foodId: food.id,
        foodNameSnapshot: food.name,
        grams: dto.grams,
        ...nutrition,
        source: 'manual',
        recordedAt: new Date(dto.recordedAt),
        note: dto.note,
      },
    });
  }

  list(userId: string, from: Date, to: Date) {
    return this.prisma.mealEntry.findMany({
      where: { userId, recordedAt: { gte: from, lt: to } },
      orderBy: { recordedAt: 'asc' },
    });
  }
}
