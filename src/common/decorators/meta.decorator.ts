import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const MetaData = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Meta => {
    const request = ctx.switchToHttp().getRequest();
    const user = request['loggedInUser'];
    const metaData = {
      user: {
        id: user,
      },
      requestId: request['request.id'],
    };
    return metaData;
  },
);

export interface Meta {
  user: {
    id: string;
  };
  requestId: string;
}
