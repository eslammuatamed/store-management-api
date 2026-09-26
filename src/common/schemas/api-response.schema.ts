import { z } from 'zod';

export const paginationMetaSchema = z.object({
  page: z.number().int().positive(),
  perPage: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export function apiSuccessResponseSchema<T extends z.ZodType>(
  dataSchema: T,
  isPaginated = false,
) {
  const schema = z.object({
    success: z.literal(true),
    statusCode: z.number().int(),
    message: z.string(),
    data: dataSchema,
  });
  if (isPaginated) {
    return schema.extend({
      meta: paginationMetaSchema,
    });
  }
  return schema;
}

export const apiErrorResponseSchema = z.object({
  success: z.literal(false),
  statusCode: z.number().int(),
  message: z.string(),
  errors: z.array(z.string()).optional(),
  path: z.string(),
});
