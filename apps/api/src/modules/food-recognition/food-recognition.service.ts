import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service.js';
import { AiAuditService } from '../ai/ai-audit.service.js';
import { MealEntriesService } from '../meal-entries/meal-entries.service.js';
import type { FoodRecognitionProvider } from './providers/food-recognition.provider.js';
import type { AnalyzeFoodImageDto, ConfirmFoodRecognitionDto, CreateFoodRecognitionUploadDto } from './food-recognition.dto.js';
import { recognitionJobDto } from './food-recognition.mapper.js';
import { FoodRecognitionConsentService } from './food-recognition-consent.service.js';
import type { RecognitionImageStorage } from './storage/recognition-image-storage.js';
import { safeRecognitionFailure } from './recognition-failure.js';

@Injectable()
export class FoodRecognitionService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject('FoodRecognitionProvider') private readonly provider: FoodRecognitionProvider,
    @Inject(MealEntriesService) private readonly mealEntries: MealEntriesService,
    @Inject(FoodRecognitionConsentService) private readonly consent: FoodRecognitionConsentService,
    @Inject(AiAuditService) private readonly audit: AiAuditService,
    @Inject('RecognitionImageStorage') private readonly storage: RecognitionImageStorage,
  ) {}

  async createUpload(userId: string, dto: CreateFoodRecognitionUploadDto) {
    await this.consent.assertGranted(userId);
    await this.prisma.user.upsert({ where: { id: userId }, create: { id: userId }, update: {} });
    return this.prisma.foodRecognitionUpload.create({ data: { userId, objectKey: this.storage.createObjectKey({ userId, contentType: dto.contentType }), contentType: dto.contentType, sizeBytes: dto.sizeBytes, expiresAt: new Date(Date.now() + 10 * 60 * 1000) } });
  }

  async completeUpload(userId: string, uploadId: string) {
    const upload = await this.prisma.foodRecognitionUpload.findFirst({ where: { id: uploadId, userId, status: 'pending', expiresAt: { gt: new Date() } } });
    if (!upload) throw new NotFoundException('上传会话不存在、已过期或无权访问');
    return this.prisma.foodRecognitionUpload.update({ where: { id: upload.id }, data: { status: 'ready', completedAt: new Date() } });
  }

  async create(userId: string, uploadId: string) {
    await this.prisma.user.upsert({ where: { id: userId }, create: { id: userId }, update: {} });
    try { await this.consent.assertGranted(userId); } catch (error) {
      await this.audit.record({ userId, message: uploadId, safetyDecision: 'block', safetyReason: 'image_recognition_consent_required' });
      throw error;
    }
    const upload = await this.prisma.foodRecognitionUpload.findFirst({ where: { id: uploadId, userId, status: 'ready', expiresAt: { gt: new Date() } } });
    if (!upload) throw new NotFoundException('上传图片不存在、未完成或无权访问');
    await this.audit.record({ userId, message: upload.objectKey, safetyDecision: 'allow', provider: this.provider.provider, model: this.provider.model });
    const job = await this.prisma.foodRecognitionJob.create({ data: { userId, imageKey: upload.objectKey, uploadId: upload.id, status: 'processing' } });
    try {
      const rawCandidates = await this.provider.recognize({ imageKey: upload.objectKey });
      const candidates = [];
      for (const [index, raw] of rawCandidates.entries()) {
        const food = await this.prisma.foodItem.findFirst({ where: { name: raw.name, isActive: true } });
        candidates.push({ jobId: job.id, foodId: food?.id, nameSnapshot: raw.name, confidence: raw.confidence, estimatedGrams: raw.estimatedGrams, estimatedEnergyKcal: raw.estimatedEnergyKcal, estimatedProteinG: raw.estimatedProteinG, estimatedFatG: raw.estimatedFatG, estimatedCarbohydrateG: raw.estimatedCarbohydrateG, rank: index + 1 });
      }
      await this.prisma.foodRecognitionCandidate.createMany({ data: candidates });
      return recognitionJobDto(await this.prisma.foodRecognitionJob.update({ where: { id: job.id }, data: { status: 'succeeded' }, include: { candidates: true } }));
    } catch (error) {
      const failure = safeRecognitionFailure(error);
      await this.prisma.foodRecognitionJob.update({ where: { id: job.id }, data: { status: 'failed', errorCode: failure.code, errorMessage: failure.message } });
      return recognitionJobDto(await this.prisma.foodRecognitionJob.findUniqueOrThrow({ where: { id: job.id }, include: { candidates: true } }));
    }
  }

  async get(userId: string, jobId: string) {
    const job = await this.prisma.foodRecognitionJob.findFirst({ where: { id: jobId, userId }, include: { candidates: true } });
    if (!job) throw new NotFoundException('识别任务不存在');
    return recognitionJobDto(job);
  }

  async analyze(userId: string, dto: AnalyzeFoodImageDto) {
    await this.consent.assertGranted(userId);
    const candidates = await this.provider.recognize({ imageKey: `inline/${userId}`, imageBase64: dto.imageBase64, contentType: dto.contentType });
    return candidates.map((candidate, index) => ({ ...candidate, rank: index + 1 }));
  }

  async confirm(userId: string, dto: ConfirmFoodRecognitionDto) {
    const candidate = await this.prisma.foodRecognitionCandidate.findFirst({ where: { id: dto.candidateId, job: { userId } }, include: { food: { include: { nutrition: true } }, job: true } });
    if (!candidate) throw new NotFoundException('识别候选未找到或无权访问');
    let foodReference: { foodId: string } | { userFoodId: string };
    if (candidate.food?.nutrition) {
      foodReference = { foodId: candidate.food.id };
    } else {
      const values = [candidate.estimatedEnergyKcal, candidate.estimatedProteinG, candidate.estimatedFatG, candidate.estimatedCarbohydrateG];
      if (!candidate.estimatedGrams || values.some((value) => value === null || value === undefined)) throw new NotFoundException('识别结果缺少营养估算，请重新拍摄');
      const per100 = (value: number) => Math.round((value * 100 / candidate.estimatedGrams) * 10) / 10;
      const nutrition = { energyKcal: per100(candidate.estimatedEnergyKcal!), proteinG: per100(candidate.estimatedProteinG!), fatG: per100(candidate.estimatedFatG!), carbohydrateG: per100(candidate.estimatedCarbohydrateG!) };
      const existing = await this.prisma.userFood.findFirst({ where: { userId, name: candidate.nameSnapshot } });
      const personal = existing
        ? await this.prisma.userFood.update({ where: { id: existing.id }, data: nutrition })
        : await this.prisma.userFood.create({ data: { userId, name: candidate.nameSnapshot, imageUrl: null, source: 'photo', ...nutrition, defaultServingLabel: '识别份量', defaultServingGrams: candidate.estimatedGrams } });
      foodReference = { userFoodId: personal.id };
    }
    const entry = await this.mealEntries.create(userId, { mealType: dto.mealType, ...foodReference, grams: dto.grams, recordedAt: dto.recordedAt, note: dto.note, source: 'photo_confirmed' });
    await this.prisma.foodRecognitionJob.update({ where: { id: candidate.jobId }, data: { status: 'confirmed' } });
    return entry;
  }
}
