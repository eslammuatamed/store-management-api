import { applyDecorators, HttpCode } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { z } from 'zod';

import { apiSuccessResponseSchema } from '../schemas/api-response.schema.js';
import { ResponseMessage } from './response-message.decorator.js';

interface ApiSuccessResponseOptions<T extends z.ZodType> {
  status: number;
  message: string;
  dataSchema: T;
  isPaginated?: boolean;
}

export function ApiSuccessResponse<T extends z.ZodType>({
  status,
  message,
  dataSchema,
  isPaginated = false,
}: ApiSuccessResponseOptions<T>) {
  return applyDecorators(
    HttpCode(status),

    ResponseMessage(message),

    ApiResponse({
      status,
      description: message,
      standardSchema: apiSuccessResponseSchema(dataSchema, isPaginated),
    }),
  );
}
