import { Controller, Get, Inject, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ValidatedBody } from '../../common/http/validated-request.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import type { AuthenticatedUser } from '../auth/auth-context.js';
import { ConfirmFoodRecognitionDto, CreateFoodRecognitionDto } from './food-recognition.dto.js';
import { FoodRecognitionService } from './food-recognition.service.js';
import { FoodRecognitionConsentService } from './food-recognition-consent.service.js';
type AuthenticatedRequest = Request & { user: AuthenticatedUser };

@Controller('food-recognition')
@UseGuards(AuthGuard)
export class FoodRecognitionController {
  constructor(
    @Inject(FoodRecognitionService) private readonly recognition: FoodRecognitionService,
    @Inject(FoodRecognitionConsentService) private readonly consent: FoodRecognitionConsentService,
  ) {}
  @Post('consents')
  async grantConsent(@Req() request: AuthenticatedRequest, @Res() response: Response) {
    return response
      .status(201)
      .send({
        data: await this.consent.grant(request.user.id),
        meta: { requestId: response.locals.requestId },
      });
  }
  @Post('jobs')
  async create(
    @Req() request: AuthenticatedRequest,
    @ValidatedBody(CreateFoodRecognitionDto) body: CreateFoodRecognitionDto,
    @Res() response: Response,
  ) {
    return response
      .status(201)
      .send({
        data: await this.recognition.create(request.user.id, body.imageKey),
        meta: { requestId: response.locals.requestId },
      });
  }
  @Get('jobs/:jobId')
  async get(
    @Req() request: AuthenticatedRequest,
    @Param('jobId') jobId: string,
    @Res() response: Response,
  ) {
    return response.send({
      data: await this.recognition.get(request.user.id, jobId),
      meta: { requestId: response.locals.requestId },
    });
  }
  @Post('confirm')
  async confirm(
    @Req() request: AuthenticatedRequest,
    @ValidatedBody(ConfirmFoodRecognitionDto) body: ConfirmFoodRecognitionDto,
    @Res() response: Response,
  ) {
    return response
      .status(201)
      .send({
        data: await this.recognition.confirm(request.user.id, body),
        meta: { requestId: response.locals.requestId },
      });
  }
}
