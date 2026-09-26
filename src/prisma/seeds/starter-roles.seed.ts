import { db } from '../db.js';

import { varchar } from '../../common/schemas/varchar.schema.js';

import { STARTER_ROLES } from '../../modules/access-control/roles/roles.constants.js';

const permissionCodeSchema = varchar(100);
const descriptionSchema = varchar(500);
const roleNameSchema = varchar(120);
const systemKeySchema = varchar(80);

export async function seedStarterRoles() {
  await db.transaction(async (tx) => {
    for (const definition of STARTER_ROLES) {
      const key = systemKeySchema.parse(definition.systemKey);

      const existing = await tx.orm.public.Role.where({
        systemKey: key,
      }).first();

      // مهم:
      // لو الدور موجود بالفعل، ما نلمسش
      // permissions اللي المستخدم عدلها.
      if (existing) {
        continue;
      }

      const role = await tx.orm.public.Role.create({
        systemKey: key,

        name: roleNameSchema.parse(definition.name),

        scopeType: definition.scopeType,

        isProtected: false,

        description: descriptionSchema.parse(definition.description),
      });

      for (const permissionCode of definition.permissions) {
        const code = permissionCodeSchema.parse(permissionCode);

        const permission = await tx.orm.public.Permission.where({
          code,
        }).first();

        if (!permission) {
          throw new Error(
            `Starter role "${definition.systemKey}" references unknown permission "${permissionCode}"`,
          );
        }

        await tx.orm.public.RolePermission.create({
          roleId: role.id,
          permissionId: permission.id,
        });
      }
    }
  });
}
