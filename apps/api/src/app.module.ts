import { Module } from '@nestjs/common';
import { SystemController } from './modules/system/system.controller.js';
import { HealthProfileModule } from './modules/health-profile/health-profile.module.js';
import { HealthRecordsModule } from './modules/health-records/health-records.module.js';
import { HealthPlansModule } from './modules/health-plans/health-plans.module.js';
import { DailyHomeModule } from './modules/daily-home/daily-home.module.js';
import { FoodCatalogModule } from './modules/food-catalog/food-catalog.module.js';
import { MealEntriesModule } from './modules/meal-entries/meal-entries.module.js';
import { FoodRecognitionModule } from './modules/food-recognition/food-recognition.module.js';
import { HealthInsightsModule } from './modules/health-insights/health-insights.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UserFoodsModule } from './modules/user-foods/user-foods.module.js';

@Module({
  imports: [
    AuthModule,
    HealthProfileModule,
    HealthRecordsModule,
    HealthPlansModule,
    DailyHomeModule,
    FoodCatalogModule,
    MealEntriesModule,
    FoodRecognitionModule,
    HealthInsightsModule,
    UserFoodsModule,
  ],
  controllers: [SystemController],
})
export class AppModule {}
