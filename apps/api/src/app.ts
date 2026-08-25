import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { requestIdMiddleware } from './common/http/request-id.middleware.js';
import { ApiExceptionFilter } from './common/http/api-exception.filter.js';

export async function createApp() {
  const app = await NestFactory.create(AppModule, { logger: ['error'] });
  app.use(requestIdMiddleware);
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
  );
  app.useGlobalFilters(new ApiExceptionFilter());
  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });
  return app;
}
