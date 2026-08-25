import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service.js';
import type { SaveCurrentPlanDto, UpdatePlanTaskDto } from './health-plans.dto.js';

const RULE_VERSION = 'daily-loop-v1';
type PlanTaskAction = 'record_weight' | 'record_meal' | 'walk_15_minutes' | 'record_sleep';

@Injectable()
export class HealthPlansService {
  constructor(private readonly prisma: PrismaService) {}

  async saveCurrent(userId: string, dto: SaveCurrentPlanDto) {
    this.assertPlanShape(dto);
    const startDate = dateOnly(dto.startDate);
    await this.ensureUser(userId);

    const plan = await this.prisma.$transaction(async (tx) => {
      await tx.personalPlan.updateMany({
        where: { userId, status: 'active' },
        data: { status: 'archived' },
      });
      await tx.healthTarget.updateMany({
        where: { userId, status: 'active' },
        data: { status: 'archived' },
      });
      const target = await tx.healthTarget.create({
        data: {
          userId,
          kind: dto.kind,
          direction: dto.kind === 'weight' ? dto.direction : null,
          targetWeightKg: dto.kind === 'weight' ? dto.targetWeightKg : null,
          startDate,
        },
      });
      const created = await tx.personalPlan.create({
        data: {
          userId,
          healthTargetId: target.id,
          kind: dto.kind,
          startDate,
          ruleVersion: RULE_VERSION,
        },
      });
      await this.ensureTasksForDate(tx, created.id, dto.kind, startDate);
      return created;
    });

    return this.getPlanById(userId, plan.id, startDate);
  }

  async getForUser(userId: string, date: string) {
    const currentDate = dateOnly(date);
    const plan = await this.prisma.personalPlan.findFirst({
      where: { userId, status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
    if (!plan) return null;
    await this.ensureTasksForDate(this.prisma, plan.id, plan.kind, currentDate);
    return this.getPlanById(userId, plan.id, currentDate);
  }

  async completeTask(userId: string, taskId: string, dto: UpdatePlanTaskDto) {
    const task = await this.prisma.planTask.findFirst({
      where: { id: taskId, plan: { userId } },
    });
    if (!task) throw new NotFoundException('未找到该计划任务');
    if (task.status !== 'pending') throw new BadRequestException('该任务已处理');
    return this.prisma.planTask.update({
      where: { id: taskId },
      data: { status: dto.status, completedAt: dto.status === 'completed' ? new Date() : null },
    });
  }

  private async getPlanById(userId: string, planId: string, scheduledFor: Date) {
    const plan = await this.prisma.personalPlan.findFirst({
      where: { id: planId, userId },
      include: {
        healthTarget: true,
        tasks: { where: { scheduledFor }, orderBy: { actionType: 'asc' } },
      },
    });
    if (!plan) throw new NotFoundException('未找到当前计划');
    return plan;
  }

  private async ensureTasksForDate(
    client: Pick<PrismaService, 'planTask'>,
    planId: string,
    kind: 'weight' | 'sleep',
    scheduledFor: Date,
  ) {
    const actions: PlanTaskAction[] =
      kind === 'weight' ? ['record_weight', 'record_meal', 'walk_15_minutes'] : ['record_sleep'];
    await Promise.all(
      actions.map((actionType) =>
        client.planTask.upsert({
          where: { planId_scheduledFor_actionType: { planId, scheduledFor, actionType } },
          create: { planId, scheduledFor, actionType },
          update: {},
        }),
      ),
    );
  }

  private assertPlanShape(dto: SaveCurrentPlanDto) {
    if (dto.kind === 'weight' && !dto.direction)
      throw new BadRequestException('体重计划需要选择目标方向');
    if (dto.kind === 'sleep' && (dto.direction || dto.targetWeightKg !== undefined)) {
      throw new BadRequestException('睡眠计划不需要体重目标');
    }
  }

  private ensureUser(userId: string) {
    return this.prisma.user.upsert({ where: { id: userId }, create: { id: userId }, update: {} });
  }
}

function dateOnly(value: string) {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) throw new BadRequestException('日期格式不正确');
  return new Date(Date.UTC(year, month - 1, day));
}
