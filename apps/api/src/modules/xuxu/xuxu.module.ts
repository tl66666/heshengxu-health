import { Module } from '@nestjs/common';
import { AiAuditService } from '../ai/ai-audit.service.js';
import { PrismaAiTraceRepository } from '../ai/prisma-ai-trace.repository.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { TokenService } from '../auth/tokens/token.service.js';
import { XuxuController } from './xuxu.controller.js';
import { XuxuService } from './xuxu.service.js';
import { PrismaService } from '../../common/database/prisma.service.js';

@Module({
  controllers: [XuxuController],
  providers: [
    AuthGuard,
    TokenService,
    PrismaService,
    PrismaAiTraceRepository,
    { provide: AiAuditService, useFactory: (repository: PrismaAiTraceRepository) => new AiAuditService(repository), inject: [PrismaAiTraceRepository] },
    XuxuService,
  ],
})
export class XuxuModule {}
