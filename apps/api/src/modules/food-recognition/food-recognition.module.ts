import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service.js';
import { AiAuditService } from '../ai/ai-audit.service.js';
import { PrismaAiTraceRepository } from '../ai/prisma-ai-trace.repository.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { MealEntriesModule } from '../meal-entries/meal-entries.module.js';
import { FoodRecognitionController } from './food-recognition.controller.js';
import { FoodRecognitionService } from './food-recognition.service.js';
import { MockFoodRecognitionProvider } from './providers/mock-food-recognition.provider.js';
import { CloudBaseFoodRecognitionProvider } from './providers/cloudbase-food-recognition.provider.js';
import { FoodRecognitionConsentService } from './food-recognition-consent.service.js';
import {
  resolveFoodRecognitionRuntimeConfig,
  type FoodRecognitionRuntimeConfig,
} from './food-recognition-runtime.config.js';
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
    CloudBaseFoodRecognitionProvider,
    MockRecognitionImageStorage,
    PrismaAiTraceRepository,
    {
      provide: 'FoodRecognitionRuntimeConfig',
      useFactory: () => resolveFoodRecognitionRuntimeConfig(),
    },
    {
      provide: 'FoodRecognitionProvider',
      useFactory: (config: FoodRecognitionRuntimeConfig, mock: MockFoodRecognitionProvider, cloudbase: CloudBaseFoodRecognitionProvider) => {
        if (config.visionProvider === 'mock') return mock;
        return cloudbase;
      },
      inject: ['FoodRecognitionRuntimeConfig', MockFoodRecognitionProvider, CloudBaseFoodRecognitionProvider],
    },
    {
      provide: 'RecognitionImageStorage',
      useFactory: (config: FoodRecognitionRuntimeConfig, mock: MockRecognitionImageStorage) => {
        if (config.storageProvider === 'mock') return mock;
        throw new Error('CloudBase food-recognition storage is not deployed in this runtime.');
      },
      inject: ['FoodRecognitionRuntimeConfig', MockRecognitionImageStorage],
    },
    {
      provide: AiAuditService,
      useFactory: (repository: PrismaAiTraceRepository) => new AiAuditService(repository),
      inject: [PrismaAiTraceRepository],
    },
  ],
})
export class FoodRecognitionModule {}
