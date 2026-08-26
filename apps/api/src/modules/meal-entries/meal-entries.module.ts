import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { MealEntriesController } from './meal-entries.controller.js';
import { MealEntriesService } from './meal-entries.service.js';

@Module({
  controllers: [MealEntriesController],
  providers: [AuthGuard, PrismaService, MealEntriesService],
})
export class MealEntriesModule {}
