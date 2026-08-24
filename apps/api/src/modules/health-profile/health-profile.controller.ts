import { Controller, Get, Inject, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import type { AuthenticatedUser } from '../auth/auth-context.js';
import { HealthProfileService } from './health-profile.service.js';

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
}
