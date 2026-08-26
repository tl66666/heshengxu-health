import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { FoodCatalogController } from './food-catalog.controller.js';
import { FoodCatalogService } from './food-catalog.service.js';

@Module({
  controllers: [FoodCatalogController],
  providers: [AuthGuard, PrismaService, FoodCatalogService],
  exports: [FoodCatalogService],
})
export class FoodCatalogModule {}
