import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { HealthRecordsController } from './health-records.controller.js';
import { HealthRecordsService } from './health-records.service.js';

@Module({
  controllers: [HealthRecordsController],
  providers: [AuthGuard, PrismaService, HealthRecordsService],
  exports: [HealthRecordsService],
})
export class HealthRecordsModule {}
