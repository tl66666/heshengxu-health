import { Module } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { HealthProfileController } from './health-profile.controller.js';
import { InMemoryHealthProfileRepository } from './health-profile.repository.js';
import { HealthProfileService } from './health-profile.service.js';

@Module({
  controllers: [HealthProfileController],
  providers: [
    AuthGuard,
    InMemoryHealthProfileRepository,
    {
      provide: HealthProfileService,
      useFactory: (repository: InMemoryHealthProfileRepository) =>
        new HealthProfileService(repository),
      inject: [InMemoryHealthProfileRepository],
    },
  ],
})
export class HealthProfileModule {}
