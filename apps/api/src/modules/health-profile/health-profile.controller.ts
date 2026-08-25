import { Controller, Get, Inject, Put, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ValidatedBody } from '../../common/http/validated-request.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import type { AuthenticatedUser } from '../auth/auth-context.js';
import { HealthProfileService } from './health-profile.service.js';
import { UpdateHealthProfileDto } from './health-profile.dto.js';

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

@Controller('health-profiles')
@UseGuards(AuthGuard)
export class HealthProfileController {
  constructor(
    @Inject(HealthProfileService) private readonly healthProfileService: HealthProfileService,
  ) {}

  @Get('me')
  async getCurrentProfile(@Req() request: AuthenticatedRequest, @Res() response: Response) {
    const profile = await this.healthProfileService.getForUser(request.user.id);
    return response.send({
      data: profile,
      meta: { requestId: response.locals.requestId },
    });
  }

  @Put('me')
  async updateCurrentProfile(
    @Req() request: AuthenticatedRequest,
    @ValidatedBody(UpdateHealthProfileDto) body: UpdateHealthProfileDto,
    @Res() response: Response,
  ) {
    const profile = await this.healthProfileService.updateForUser(request.user.id, {
      displayName: body.displayName ?? null,
      birthDate: body.birthDate ? new Date(body.birthDate) : null,
      sex: body.sex ?? 'unspecified',
      heightCm: body.heightCm ?? null,
      weightKg: body.weightKg ?? null,
      primaryGoal: body.primaryGoal ?? null,
    });
    return response.send({ data: profile, meta: { requestId: response.locals.requestId } });
  }
}
