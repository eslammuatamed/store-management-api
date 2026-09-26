import { z } from 'zod';

import { varchar } from '../../../../common/schemas/varchar.schema.js';

const permissionFields = {
  id: z.string(),

  code: varchar(100),

  scopePolicy: z.enum(['global_only', 'location_or_global']),

  description: varchar(500).nullable(),

  createdAt: z.string(),
};

export const permissionResponseSchema = z.object(permissionFields).strict();

export const permissionsResponseSchema = z.array(permissionResponseSchema);

export type PermissionResponseDto = z.infer<typeof permissionResponseSchema>;
