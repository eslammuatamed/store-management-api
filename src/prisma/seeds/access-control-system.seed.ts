import { db } from '../db.js';

import { varchar } from '../../common/schemas/varchar.schema.js';

import { PERMISSION_CATALOG } from '../../modules/access-control/permissions/permissions.constants.js';
import { SUPER_ADMIN_ROLE } from '../../modules/access-control/roles/roles.constants.js';

const permissionCodeSchema = varchar(100);
const descriptionSchema = varchar(500);
const roleNameSchema = varchar(120);
const systemKeySchema = varchar(80);

export async function seedAccessControlSystem() {
  await db.transaction(async (tx) => {
    const permissions = [];

    for (const resource of PERMISSION_CATALOG) {
      for (const action of resource.actions) {
        const code = permissionCodeSchema.parse(
          `${resource.resource}.${action.name}`,
        );

        const permission = await tx.orm.public.Permission.upsert({
          create: {
            code,
            scopePolicy: action.scopePolicy ?? resource.scopePolicy,

            description: descriptionSchema.parse(action.description),
          },

          update: {
            scopePolicy: action.scopePolicy ?? resource.scopePolicy,

            description: descriptionSchema.parse(action.description),
          },

          conflictOn: {
            code,
          },
        });

        permissions.push(permission);
      }
    }

    const superAdminKey = systemKeySchema.parse(SUPER_ADMIN_ROLE.systemKey);

    const superAdmin = await tx.orm.public.Role.upsert({
      create: {
        systemKey: superAdminKey,

        name: roleNameSchema.parse(SUPER_ADMIN_ROLE.name),

        scopeType: SUPER_ADMIN_ROLE.scopeType,

        isProtected: true,

        description: descriptionSchema.parse(SUPER_ADMIN_ROLE.description),
      },

      update: {
        name: roleNameSchema.parse(SUPER_ADMIN_ROLE.name),

        scopeType: SUPER_ADMIN_ROLE.scopeType,

        isProtected: true,

        description: descriptionSchema.parse(SUPER_ADMIN_ROLE.description),
      },

      conflictOn: {
        systemKey: superAdminKey,
      },
    });

    const existingAssignments = await tx.orm.public.RolePermission.where({
      roleId: superAdmin.id,
    }).all();

    const assignedPermissionIds = new Set(
      existingAssignments.map((item) => item.permissionId.toString()),
    );

    const missingAssignments = permissions
      .filter(
        (permission) => !assignedPermissionIds.has(permission.id.toString()),
      )
      .map((permission) => ({
        roleId: superAdmin.id,
        permissionId: permission.id,
      }));

    if (missingAssignments.length > 0) {
      await tx.orm.public.RolePermission.createAndCount(missingAssignments);
    }
  });
}
