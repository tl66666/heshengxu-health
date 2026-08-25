import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service.js';
import type { AiTrace, AiTraceRepository } from './ai-audit.service.js';

@Injectable()
export class PrismaAiTraceRepository implements AiTraceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(trace: AiTrace): Promise<void> {
    await this.prisma.aiTrace.create({
      data: {
        userId: trace.userId,
        requestHash: trace.requestHash,
        safetyDecision: trace.safetyDecision,
        safetyReason: trace.safetyReason,
        provider: trace.provider,
        model: trace.model,
      },
    });
  }
}
