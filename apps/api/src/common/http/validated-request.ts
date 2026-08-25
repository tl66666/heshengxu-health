import { Body, Query, ValidationPipe, type Type } from '@nestjs/common';

function dtoPipe(dto: Type<unknown>) {
  return new ValidationPipe({
    expectedType: dto,
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  });
}

export function ValidatedBody(dto: Type<unknown>): ParameterDecorator {
  return Body(dtoPipe(dto));
}

export function ValidatedQuery(dto: Type<unknown>): ParameterDecorator {
  return Query(dtoPipe(dto));
}
