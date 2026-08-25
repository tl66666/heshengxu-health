import { Module } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { HealthProfileModule } from '../health-profile/health-profile.module.js';
import { HealthPlansModule } from '../health-plans/health-plans.module.js';
import { HealthRecordsModule } from '../health-records/health-records.module.js';
import { DailyHomeController } from './daily-home.controller.js';
import { DailyHomeService } from './daily-home.service.js';

@Module({
  imports: [HealthProfileModule, HealthPlansModule, HealthRecordsModule],
  controllers: [DailyHomeController],
  providers: [AuthGuard, DailyHomeService],
})
export class DailyHomeModule {}
