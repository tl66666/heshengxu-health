import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service.js';
import { AiAuditService } from '../ai/ai-audit.service.js';
import { MealEntriesService } from '../meal-entries/meal-entries.service.js';
import type { FoodRecognitionProvider } from './providers/food-recognition.provider.js';
import type { ConfirmFoodRecognitionDto } from './food-recognition.dto.js';
import { recognitionJobDto } from './food-recognition.mapper.js';
import { FoodRecognitionConsentService } from './food-recognition-consent.service.js';

@Injectable()
export class FoodRecognitionService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject('FoodRecognitionProvider') private readonly provider: FoodRecognitionProvider,
    @Inject(MealEntriesService) private readonly mealEntries: MealEntriesService,
    @Inject(FoodRecognitionConsentService) private readonly consent: FoodRecognitionConsentService,
    @Inject(AiAuditService) private readonly audit: AiAuditService,
  ) {}

  async create(userId: string, imageKey: string) {
    await this.prisma.user.upsert({ where: { id: userId }, create: { id: userId }, update: {} });
    try {
      await this.consent.assertGranted(userId);
    } catch (error) {
      await this.audit.record({
        userId,
        message: imageKey,
        safetyDecision: 'block',
        safetyReason: 'image_recognition_consent_required',
      });
      throw error;
    }
    await this.audit.record({
      userId,
      message: imageKey,
      safetyDecision: 'allow',
      provider: this.provider.provider,
      model: this.provider.model,
    });
    const job = await this.prisma.foodRecognitionJob.create({
      data: { userId, imageKey, status: 'processing' },
    });
    try {
      const rawCandidates = await this.provider.recognize({ imageKey });
      const candidates = [];
      for (const [index, raw] of rawCandidates.entries()) {
        const food = await this.prisma.foodItem.findFirst({
          where: { name: raw.name, isActive: true },
        });
        candidates.push({
          jobId: job.id,
          foodId: food?.id,
          nameSnapshot: raw.name,
          confidence: raw.confidence,
          estimatedGrams: raw.estimatedGrams,
          rank: index + 1,
        });
      }
      await this.prisma.foodRecognitionCandidate.createMany({ data: candidates });
      return recognitionJobDto(
        await this.prisma.foodRecognitionJob.update({
          where: { id: job.id },
          data: { status: 'succeeded' },
          include: { candidates: true },
        }),
      );
    } catch (error) {
      await this.prisma.foodRecognitionJob.update({
        where: { id: job.id },
        data: {
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : '识别失败',
        },
      });
      throw error;
    }
  }

  async get(userId: string, jobId: string) {
    const job = await this.prisma.foodRecognitionJob.findFirst({
      where: { id: jobId, userId },
      include: { candidates: true },
    });
    if (!job) throw new NotFoundException('识别任务不存在');
    return recognitionJobDto(job);
  }

  async confirm(userId: string, dto: ConfirmFoodRecognitionDto) {
    const candidate = await this.prisma.foodRecognitionCandidate.findFirst({
      where: { id: dto.candidateId, job: { userId } },
      include: { food: { include: { nutrition: true } }, job: true },
    });
    if (!candidate?.food?.nutrition) throw new NotFoundException('候选食品没有可用营养数据');
    const entry = await this.mealEntries.create(userId, {
      mealType: dto.mealType,
      foodId: candidate.food.id,
      grams: dto.grams,
      recordedAt: dto.recordedAt,
      note: dto.note,
      source: 'photo_confirmed',
    });
    await this.prisma.foodRecognitionJob.update({
      where: { id: candidate.jobId },
      data: { status: 'confirmed' },
    });
    return entry;
  }
}
