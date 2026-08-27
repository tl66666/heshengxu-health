import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { calculateNutritionForGrams } from '@heban/domain';
import { PrismaService } from '../../common/database/prisma.service.js';
import type { CreateMealEntryDto } from './meal-entries.dto.js';
import type { ReplaceMealEntryDto } from './meal-entries.dto.js';

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
        source: dto.source ?? 'manual',
        recordedAt: new Date(dto.recordedAt),
        note: dto.note,
      },
    });
  }

  list(userId: string, from: Date, to: Date) {
    return this.prisma.mealEntry.findMany({
      where: { userId, isCurrent: true, recordedAt: { gte: from, lt: to } },
      orderBy: { recordedAt: 'asc' },
    });
  }

  listForDate(userId: string, date: string) {
    const [year, month, day] = date.slice(0, 10).split('-').map(Number);
    if (!year || !month || !day) throw new NotFoundException('日期格式不正确');
    const from = new Date(Date.UTC(year, month - 1, day, -8));
    return this.list(userId, from, new Date(from.getTime() + 24 * 60 * 60 * 1000));
  }

  async replace(userId: string, recordId: string, dto: ReplaceMealEntryDto) {
    return this.prisma.$transaction(async (tx) => {
      const old = await tx.mealEntry.findFirst({
        where: { id: recordId, userId, isCurrent: true },
      });
      if (!old) throw new NotFoundException('未找到可修改的餐食记录');
      const foodId = dto.foodId ?? old.foodId;
      if (!foodId) throw new NotFoundException('原食品已不可用，请重新记录');
      const food = await tx.foodItem.findFirst({
        where: { id: foodId, isActive: true },
        include: { nutrition: true },
      });
      if (!food?.nutrition) throw new NotFoundException('食品不存在或暂未完善');
      const grams = dto.grams ?? old.grams;
      const nutrition = calculateNutritionForGrams(food.nutrition, grams);
      await tx.mealEntry.update({
        where: { id: old.id },
        data: { isCurrent: false, supersededAt: new Date() },
      });
      return tx.mealEntry.create({
        data: {
          userId,
          mealType: dto.mealType ?? old.mealType,
          foodId: food.id,
          foodNameSnapshot: food.name,
          grams,
          ...nutrition,
          source: old.source,
          recordedAt: dto.recordedAt ? new Date(dto.recordedAt) : old.recordedAt,
          note: dto.note ?? old.note ?? undefined,
          previousRecordId: old.id,
        },
      });
    });
  }

  async remove(userId: string, recordId: string) {
    const current = await this.prisma.mealEntry.findFirst({
      where: { id: recordId, userId, isCurrent: true },
    });
    if (!current) throw new NotFoundException('未找到可删除的餐食记录');
    await this.prisma.mealEntry.update({
      where: { id: current.id },
      data: { isCurrent: false, supersededAt: new Date(), deletedAt: new Date() },
    });
  }
}
