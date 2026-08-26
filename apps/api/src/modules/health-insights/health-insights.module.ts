import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { HealthInsightsController } from './health-insights.controller.js';
import { HealthInsightsService } from './health-insights.service.js';

@Module({
  controllers: [HealthInsightsController],
  providers: [AuthGuard, PrismaService, HealthInsightsService],
})
export class HealthInsightsModule {}
