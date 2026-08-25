import { Module } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { PrismaService } from '../../common/database/prisma.service.js';
import { HealthProfileController } from './health-profile.controller.js';
import { PrismaHealthProfileRepository } from './prisma-health-profile.repository.js';
import { HealthProfileService } from './health-profile.service.js';

@Module({
  controllers: [HealthProfileController],
  providers: [
    AuthGuard,
    PrismaService,
    PrismaHealthProfileRepository,
    {
      provide: HealthProfileService,
      useFactory: (repository: PrismaHealthProfileRepository) =>
        new HealthProfileService(repository),
      inject: [PrismaHealthProfileRepository],
    },
  ],
  exports: [HealthProfileService],
})
export class HealthProfileModule {}
