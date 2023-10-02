// response.dto.ts
export class SuccessResponseDto<T> {
  statusCode: number;
  data: T;
}

export class ErrorResponseDto {
  statusCode: number;
  message: string;
}

