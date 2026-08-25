import { Module } from '@nestjs/common';
import { SystemController } from './modules/system/system.controller.js';
import { HealthProfileModule } from './modules/health-profile/health-profile.module.js';
import { HealthRecordsModule } from './modules/health-records/health-records.module.js';
import { HealthPlansModule } from './modules/health-plans/health-plans.module.js';
import { DailyHomeModule } from './modules/daily-home/daily-home.module.js';

@Module({
  imports: [HealthProfileModule, HealthRecordsModule, HealthPlansModule, DailyHomeModule],
  controllers: [SystemController],
})
export class AppModule {}
