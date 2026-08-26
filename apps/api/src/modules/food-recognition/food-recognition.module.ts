import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service.js';
import { AiAuditService } from '../ai/ai-audit.service.js';
import { PrismaAiTraceRepository } from '../ai/prisma-ai-trace.repository.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { MealEntriesModule } from '../meal-entries/meal-entries.module.js';
import { FoodRecognitionController } from './food-recognition.controller.js';
import { FoodRecognitionService } from './food-recognition.service.js';
import { MockFoodRecognitionProvider } from './providers/mock-food-recognition.provider.js';
import { FoodRecognitionConsentService } from './food-recognition-consent.service.js';
import { MockRecognitionImageStorage } from './storage/mock-recognition-image-storage.js';

@Module({
  imports: [MealEntriesModule],
  controllers: [FoodRecognitionController],
  providers: [
    AuthGuard,
    PrismaService,
    FoodRecognitionConsentService,
    FoodRecognitionService,
    MockFoodRecognitionProvider,
    MockRecognitionImageStorage,
    PrismaAiTraceRepository,
    { provide: 'FoodRecognitionProvider', useExisting: MockFoodRecognitionProvider },
    { provide: 'RecognitionImageStorage', useExisting: MockRecognitionImageStorage },
    {
      provide: AiAuditService,
      useFactory: (repository: PrismaAiTraceRepository) => new AiAuditService(repository),
      inject: [PrismaAiTraceRepository],
    },
  ],
})
export class FoodRecognitionModule {}
