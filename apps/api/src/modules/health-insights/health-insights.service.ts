import { Inject, Injectable } from '@nestjs/common';
import { buildWeeklyReview, weekRangeForShanghai } from '@heban/domain';
import { PrismaService } from '../../common/database/prisma.service.js';

@Injectable()
export class HealthInsightsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getWeeklyForUser(userId: string, date: string) {
    const range = weekRangeForShanghai(date);
    const from = shanghaiDayStart(range.startDate);
    const to = new Date(shanghaiDayStart(range.endDate).getTime() + 24 * 60 * 60 * 1000);
    const current = { userId, isCurrent: true, recordedAt: { gte: from, lt: to } };
    const [weights, meals, activities, sleeps, tasks] = await Promise.all([
      this.prisma.weightRecord.findMany({ where: current }),
      this.prisma.mealEntry.findMany({ where: current }),
      this.prisma.activityRecord.findMany({ where: current }),
      this.prisma.sleepRecord.findMany({ where: current }),
      this.prisma.planTask.findMany({
        where: { plan: { userId, status: 'active' }, scheduledFor: { gte: from, lt: to } },
      }),
    ]);

    return buildWeeklyReview({
      anchorDate: date,
      weights: weights.map((item) => ({ recordedAt: item.recordedAt.toISOString(), valueKg: item.valueKg })),
      meals: meals.map((item) => ({ recordedAt: item.recordedAt.toISOString(), energyKcal: item.energyKcal })),
      activities: activities.map((item) => ({ recordedAt: item.recordedAt.toISOString(), durationMinutes: item.durationMinutes })),
      sleeps: sleeps.map((item) => ({ recordedAt: item.recordedAt.toISOString(), durationMinutes: item.durationMinutes })),
      tasks: tasks.map((item) => ({ status: item.status })),
    });
  }
}

function shanghaiDayStart(date: string) {
  const [year = 0, month = 0, day = 0] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, -8));
}
