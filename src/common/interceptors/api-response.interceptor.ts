import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, type Observable } from 'rxjs';

import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator.js';

interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

interface ApiSuccessResponse<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

function isPaginatedResult(value: unknown): value is PaginatedResult<unknown> {
  if (
    value === null ||
    typeof value !== 'object' ||
    !('data' in value) ||
    !('meta' in value)
  ) {
    return false;
  }

  const meta = value.meta;

  return (
    Array.isArray(value.data) &&
    meta !== null &&
    typeof meta === 'object' &&
    'page' in meta &&
    'perPage' in meta &&
    'total' in meta &&
    'totalPages' in meta
  );
}

@Injectable()
export class ApiResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiSuccessResponse<unknown>
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiSuccessResponse<unknown>> {
    const response = context
      .switchToHttp()
      .getResponse<{ statusCode: number }>();

    const message =
      this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 'Request completed successfully';

    return next.handle().pipe(
      map((result) => {
        if (isPaginatedResult(result)) {
          return {
            success: true as const,
            statusCode: response.statusCode,
            message,
            data: result.data,
            meta: result.meta,
          };
        }

        return {
          success: true as const,
          statusCode: response.statusCode,
          message,
          data: result,
        };
      }),
    );
  }
}
