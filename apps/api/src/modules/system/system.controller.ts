import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';

@Controller()
export class SystemController {
  @Get('health')
  health(@Res() response: Response) {
    return response.status(200).send({
      data: { status: 'ok' },
      meta: { requestId: response.locals.requestId },
    });
  }
}
