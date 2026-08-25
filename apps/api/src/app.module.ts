import { Module } from '@nestjs/common';
import { SystemController } from './modules/system/system.controller.js';
import { HealthProfileModule } from './modules/health-profile/health-profile.module.js';
import { HealthRecordsModule } from './modules/health-records/health-records.module.js';

@Module({ imports: [HealthProfileModule, HealthRecordsModule], controllers: [SystemController] })
export class AppModule {}
