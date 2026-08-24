import { Module } from '@nestjs/common';
import { SystemController } from './modules/system/system.controller.js';
import { HealthProfileModule } from './modules/health-profile/health-profile.module.js';

@Module({ imports: [HealthProfileModule], controllers: [SystemController] })
export class AppModule {}
