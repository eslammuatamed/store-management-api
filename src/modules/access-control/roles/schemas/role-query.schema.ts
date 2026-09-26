import { z } from 'zod';

import {
  ApiQueryPolicy,
  createApiQuerySchema,
} from '../../../../common/schemas/api-query.schema.js';

export const roleQueryPolicy = {
  fields: [
    'id',
    'systemKey',
    'name',
    'scopeType',
    'isProtected',
    'description',
    'createdAt',
    'updatedAt',
  ],
  includes: ['permissions'],
  sortable: ['name', 'scopeType', 'createdAt', 'updatedAt'],
  searchable: ['name', 'description'],
  defaultPerPage: 20,
  maxPerPage: 100,
} as const satisfies ApiQueryPolicy;

export const roleQuerySchema = createApiQuerySchema(roleQueryPolicy);

export type RoleQueryDto = z.infer<typeof roleQuerySchema>;
