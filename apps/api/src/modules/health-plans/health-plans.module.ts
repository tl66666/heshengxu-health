import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { HealthPlansController } from './health-plans.controller.js';
import { HealthPlansService } from './health-plans.service.js';

@Module({
  controllers: [HealthPlansController],
  providers: [AuthGuard, PrismaService, HealthPlansService],
  exports: [HealthPlansService],
})
export class HealthPlansModule {}
