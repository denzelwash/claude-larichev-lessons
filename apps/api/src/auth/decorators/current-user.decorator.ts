import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PublicUser } from '@app/shared';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): PublicUser => {
    return ctx.switchToHttp().getRequest().user;
  },
);
