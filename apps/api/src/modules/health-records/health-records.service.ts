import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service.js';
import type {
  CreateActivityRecordDto,
  CreateMealStructureRecordDto,
  CreateSleepRecordDto,
  CreateWeightRecordDto,
  ReplaceHealthRecordDto,
} from './health-records.dto.js';

export type HealthRecordType = 'weight' | 'meal-structure' | 'activity' | 'sleep';

type TodayRecords = {
  timeZone: 'Asia/Shanghai';
  weight: unknown | null;
  meals: unknown[];
  activities: unknown[];
  sleep: unknown | null;
};

@Injectable()
export class HealthRecordsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async createWeight(userId: string, dto: CreateWeightRecordDto) {
    await this.ensureUser(userId);
    return this.prisma.weightRecord.create({
      data: { userId, valueKg: dto.valueKg, recordedAt: new Date(dto.recordedAt), note: dto.note },
    });
  }

  async createMealStructure(userId: string, dto: CreateMealStructureRecordDto) {
    await this.ensureUser(userId);
    return this.prisma.mealStructureRecord.create({
      data: {
        userId,
        mealType: dto.mealType,
        hasStaple: dto.hasStaple,
        hasProtein: dto.hasProtein,
        hasVegetable: dto.hasVegetable,
        recordedAt: new Date(dto.recordedAt),
        note: dto.note,
      },
    });
  }

  async createActivity(userId: string, dto: CreateActivityRecordDto) {
    await this.ensureUser(userId);
    return this.prisma.activityRecord.create({
      data: {
        userId,
        activityType: dto.activityType,
        durationMinutes: dto.durationMinutes,
        intensity: dto.intensity,
        recordedAt: new Date(dto.recordedAt),
        note: dto.note,
      },
    });
  }

  async createSleep(userId: string, dto: CreateSleepRecordDto) {
    await this.ensureUser(userId);
    return this.prisma.sleepRecord.create({
      data: {
        userId,
        durationMinutes: dto.durationMinutes,
        quality: dto.quality,
        sleepAt: dto.sleepAt ? new Date(dto.sleepAt) : undefined,
        wakeAt: dto.wakeAt ? new Date(dto.wakeAt) : undefined,
        recordedAt: new Date(dto.recordedAt),
        note: dto.note,
      },
    });
  }

  async replace(
    userId: string,
    type: HealthRecordType,
    recordId: string,
    dto: ReplaceHealthRecordDto,
  ) {
    await this.ensureUser(userId);
    switch (type) {
      case 'weight':
        return this.prisma.$transaction(async (tx) => {
          const old = await tx.weightRecord.findFirst({
            where: { id: recordId, userId, isCurrent: true },
          });
          if (!old) throw new NotFoundException('未找到可修改的体重记录');
          await tx.weightRecord.update({
            data: { isCurrent: false, supersededAt: new Date() },
            where: { id: old.id },
          });
          return tx.weightRecord.create({
            data: {
              userId,
              valueKg: dto.valueKg ?? old.valueKg,
              recordedAt: dto.recordedAt ? new Date(dto.recordedAt) : old.recordedAt,
              note: dto.note ?? old.note ?? undefined,
              previousRecordId: old.id,
            },
          });
        });
      case 'meal-structure':
        return this.prisma.$transaction(async (tx) => {
          const old = await tx.mealStructureRecord.findFirst({
            where: { id: recordId, userId, isCurrent: true },
          });
          if (!old) throw new NotFoundException('未找到可修改的饮食记录');
          await tx.mealStructureRecord.update({
            data: { isCurrent: false, supersededAt: new Date() },
            where: { id: old.id },
          });
          return tx.mealStructureRecord.create({
            data: {
              userId,
              mealType: dto.mealType ?? old.mealType,
              hasStaple: dto.hasStaple ?? old.hasStaple,
              hasProtein: dto.hasProtein ?? old.hasProtein,
              hasVegetable: dto.hasVegetable ?? old.hasVegetable,
              recordedAt: dto.recordedAt ? new Date(dto.recordedAt) : old.recordedAt,
              note: dto.note ?? old.note ?? undefined,
              previousRecordId: old.id,
            },
          });
        });
      case 'activity':
        return this.prisma.$transaction(async (tx) => {
          const old = await tx.activityRecord.findFirst({
            where: { id: recordId, userId, isCurrent: true },
          });
          if (!old) throw new NotFoundException('未找到可修改的活动记录');
          await tx.activityRecord.update({
            data: { isCurrent: false, supersededAt: new Date() },
            where: { id: old.id },
          });
          return tx.activityRecord.create({
            data: {
              userId,
              activityType: dto.activityType ?? old.activityType,
              durationMinutes: dto.durationMinutes ?? old.durationMinutes,
              intensity: dto.intensity ?? old.intensity ?? undefined,
              recordedAt: dto.recordedAt ? new Date(dto.recordedAt) : old.recordedAt,
              note: dto.note ?? old.note ?? undefined,
              previousRecordId: old.id,
            },
          });
        });
      case 'sleep':
        return this.prisma.$transaction(async (tx) => {
          const old = await tx.sleepRecord.findFirst({
            where: { id: recordId, userId, isCurrent: true },
          });
          if (!old) throw new NotFoundException('未找到可修改的睡眠记录');
          await tx.sleepRecord.update({
            data: { isCurrent: false, supersededAt: new Date() },
            where: { id: old.id },
          });
          return tx.sleepRecord.create({
            data: {
              userId,
              durationMinutes: dto.durationMinutes ?? old.durationMinutes,
              quality: dto.quality ?? old.quality,
              sleepAt: dto.sleepAt ? new Date(dto.sleepAt) : old.sleepAt,
              wakeAt: dto.wakeAt ? new Date(dto.wakeAt) : old.wakeAt,
              recordedAt: dto.recordedAt ? new Date(dto.recordedAt) : old.recordedAt,
              note: dto.note ?? old.note ?? undefined,
              previousRecordId: old.id,
            },
          });
        });
    }
  }

  async getTodayForUser(userId: string, date: string): Promise<TodayRecords> {
    const { start, end } = shanghaiDayRange(date);
    const where = { userId, isCurrent: true, recordedAt: { gte: start, lt: end } };
    const [weights, meals, activities, sleeps] = await Promise.all([
      this.prisma.weightRecord.findMany({ where, orderBy: { recordedAt: 'desc' } }),
      this.prisma.mealStructureRecord.findMany({ where, orderBy: { recordedAt: 'asc' } }),
      this.prisma.activityRecord.findMany({ where, orderBy: { recordedAt: 'asc' } }),
      this.prisma.sleepRecord.findMany({ where, orderBy: { recordedAt: 'desc' } }),
    ]);
    return {
      timeZone: 'Asia/Shanghai',
      weight: weights[0] ?? null,
      meals,
      activities,
      sleep: sleeps[0] ?? null,
    };
  }

  private ensureUser(userId: string) {
    return this.prisma.user.upsert({ where: { id: userId }, create: { id: userId }, update: {} });
  }
}

function shanghaiDayRange(date: string) {
  const [year, month, day] = date.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) throw new NotFoundException('日期格式不正确');
  const start = new Date(Date.UTC(year, month - 1, day, -8));
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}
