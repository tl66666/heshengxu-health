import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { UserFoodsController } from './user-foods.controller.js';
import { UserFoodsService } from './user-foods.service.js';

@Module({
  controllers: [UserFoodsController],
  providers: [AuthGuard, PrismaService, UserFoodsService],
  exports: [UserFoodsService],
})
export class UserFoodsModule {}
