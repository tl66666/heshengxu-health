import { Catch, HttpException, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';

const errorCodes: Record<number, string> = {
  400: 'VALIDATION_FAILED',
  401: 'UNAUTHENTICATED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : 500;
    const body = exception instanceof HttpException ? exception.getResponse() : null;
    const message =
      typeof body === 'object' && body && 'message' in body ? body.message : '服务暂时不可用';

    response.status(status).send({
      error: {
        code: errorCodes[status] ?? 'INTERNAL_ERROR',
        message: Array.isArray(message) ? message.join('；') : message,
        requestId: response.locals.requestId,
      },
    });
  }
}
