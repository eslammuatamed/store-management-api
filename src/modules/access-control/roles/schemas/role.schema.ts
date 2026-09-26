import { varchar } from '../../../../common/schemas/varchar.schema.js';
import { z } from 'zod';
import { permissionsResponseSchema } from '../../permissions/schemas/permission.schema.js';

const roleFields = {
  id: z.string(),
  systemKey: varchar(80).nullable(),
  name: varchar(120, 2),
  scopeType: z.enum(['global', 'location']),
  isProtected: z.boolean(),
  description: varchar(500, 1).nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
};

export const roleResponseSchema = z.object(roleFields).strict();
export const roleListItemResponseSchema = roleResponseSchema.partial().extend({
  permissions: permissionsResponseSchema.optional(),
});

export const rolesResponseSchema = z.array(roleListItemResponseSchema);

export const roleInputSchema = z
  .object({
    name: roleFields.name,
    scopeType: roleFields.scopeType,
    description: roleFields.description.optional(),
  })
  .strict();

export const createRoleSchema = roleInputSchema;
export const updateRoleSchema = roleInputSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type RoleResponseDto = z.infer<typeof roleResponseSchema>;
export type RolesResponseDto = z.infer<typeof rolesResponseSchema>;
export type CreateRoleDto = z.infer<typeof createRoleSchema>;
export type UpdateRoleDto = z.infer<typeof updateRoleSchema>;
