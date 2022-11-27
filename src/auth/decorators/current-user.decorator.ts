import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (property: string, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return property ? user?.[property] : user;
  },
);
