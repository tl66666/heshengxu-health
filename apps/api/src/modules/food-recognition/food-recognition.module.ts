import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { MealEntriesModule } from '../meal-entries/meal-entries.module.js';
import { FoodRecognitionController } from './food-recognition.controller.js';
import { FoodRecognitionService } from './food-recognition.service.js';
import { MockFoodRecognitionProvider } from './providers/mock-food-recognition.provider.js';

@Module({
  imports: [MealEntriesModule],
  controllers: [FoodRecognitionController],
  providers: [AuthGuard, PrismaService, FoodRecognitionService, MockFoodRecognitionProvider, { provide: 'FoodRecognitionProvider', useExisting: MockFoodRecognitionProvider }],
})
export class FoodRecognitionModule {}
