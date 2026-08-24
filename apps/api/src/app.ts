import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { requestIdMiddleware } from './common/http/request-id.middleware.js';

export async function createApp() {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.use(requestIdMiddleware);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });
  return app;
}
