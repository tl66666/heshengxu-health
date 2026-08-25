import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service.js';
import type {
  HealthProfile,
  HealthProfileRepository,
  HealthProfileUpdate,
} from './health-profile.repository.js';

@Injectable()
export class PrismaHealthProfileRepository implements HealthProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateForUser(userId: string): Promise<HealthProfile> {
    await this.prisma.user.upsert({ where: { id: userId }, create: { id: userId }, update: {} });
    const profile = await this.prisma.healthProfile.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
    return this.toHealthProfile(profile);
  }

  async updateForUser(userId: string, update: HealthProfileUpdate): Promise<HealthProfile> {
    await this.prisma.user.upsert({ where: { id: userId }, create: { id: userId }, update: {} });
    const profile = await this.prisma.healthProfile.upsert({
      where: { userId },
      create: { userId, ...update },
      update,
    });
    return this.toHealthProfile(profile);
  }

  private toHealthProfile(profile: HealthProfile): HealthProfile {
    return profile;
  }
}
