import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SuccessResponseDto, ErrorResponseDto } from '../dto/response.dto';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, SuccessResponseDto<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessResponseDto<T>> {
    return next.handle().pipe(
      map((data) => ({
        statusCode: HttpStatus.OK,
        data,
      })),
    );
  }
}

@Injectable()
export class ErrorInterceptor
  implements NestInterceptor<Error, ErrorResponseDto>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ErrorResponseDto> {
    return next.handle().pipe(
      map((error) => {
        const response = context.switchToHttp().getResponse();
        const statusCode =
          error instanceof HttpException
            ? error.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        return {
          statusCode,
          message: error.message || 'Internal Server Error',
        };
      }),
    );
  }
}
