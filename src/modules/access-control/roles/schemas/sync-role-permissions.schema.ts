import { z } from 'zod';

import { bigintIdSchema } from '../../../../common/schemas/id.schema.js';

export const syncRolePermissionsSchema = z
  .object({
    permissionIds: z
      .array(bigintIdSchema)
      .transform((ids) => [...new Set(ids)]),
  })
  .strict();

export type SyncRolePermissionsDto = z.infer<typeof syncRolePermissionsSchema>;
