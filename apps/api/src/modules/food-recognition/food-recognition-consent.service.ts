import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service.js';

export const FOOD_RECOGNITION_CONSENT_VERSION = 'food-recognition-v1';

@Injectable()
export class FoodRecognitionConsentService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async grant(userId: string) {
    await this.prisma.user.upsert({ where: { id: userId }, create: { id: userId }, update: {} });
    const existing = await this.prisma.consent.findFirst({
      where: { userId, documentVersion: FOOD_RECOGNITION_CONSENT_VERSION },
    });
    if (existing) return existing;
    return this.prisma.consent.create({
      data: { userId, documentVersion: FOOD_RECOGNITION_CONSENT_VERSION },
    });
  }

  async assertGranted(userId: string) {
    const consent = await this.prisma.consent.findFirst({
      where: { userId, documentVersion: FOOD_RECOGNITION_CONSENT_VERSION },
    });
    if (!consent) throw new ForbiddenException('请先授权使用图片识别功能');
  }
}
