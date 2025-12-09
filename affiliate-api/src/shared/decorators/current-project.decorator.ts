import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentProject = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.projectId || request.projectId;
  }
);
