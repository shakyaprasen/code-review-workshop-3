import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { v1 } from 'uuid';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    try {
      // Add required authentication logic here

      const requestId = v1();

      // Bind `request.id` so that it is available for injection downstream
      req['request.id'] = requestId;
    } catch (err) {
      throw new UnauthorizedException(err.message || 'Unauthorized access.');
    }

    next();
  }
}
