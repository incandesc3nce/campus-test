import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from '../types/JwtPayload';

/**
 * Декоратор для получения текущего пользователя из запроса.
 */
export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const req: Request & { user: JwtPayload } = ctx.switchToHttp().getRequest();
  return req.user;
});
