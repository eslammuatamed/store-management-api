import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service.js';
import { CreateRoleDto, UpdateRoleDto } from './schemas/role.schema.js';
import { SyncRolePermissionsDto } from './schemas/sync-role-permissions.schema.js';
import { or } from '@prisma/orm-postgres/orm-client';
import {
  roleQueryPolicy,
  type RoleQueryDto,
} from './schemas/role-query.schema.js';
import { ApiQueryBuilder } from '../../../common/lib/api-query.builder.js';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: CreateRoleDto) {
    return this.prisma.orm.Role.create({
      name: body.name,
      description: body.description,
      scopeType: body.scopeType,
    });
  }

  async findAll(query: RoleQueryDto) {
    const apiQuery = new ApiQueryBuilder(query, roleQueryPolicy);
    let rolesQuery = this.prisma.orm.Role;

    const search = apiQuery.searchPattern;

    if (search) {
      rolesQuery = rolesQuery.where((role) =>
        or(
          ...roleQueryPolicy.searchable.map((field) =>
            role[field].ilike(search),
          ),
        ),
      );
    }

    const { total } = await rolesQuery.aggregate((agg) => ({
      total: agg.count(),
    }));

    const { field, direction } = apiQuery.sort;

    rolesQuery = rolesQuery.orderBy((role) => {
      const roleField = role[field];

      return direction === 'asc' ? roleField.asc() : roleField.desc();
    });

    const paginatedQuery = rolesQuery
      .select(...apiQuery.fields)
      .offset(apiQuery.offset)
      .limit(apiQuery.limit);

    let data;

    if (apiQuery.hasInclude('permissions')) {
      const rows = await paginatedQuery
        .include('rolePermissions', (rolePermissions) =>
          rolePermissions.include('permission'),
        )
        .all();

      data = rows.map(({ rolePermissions, ...role }) => ({
        ...role,
        permissions: rolePermissions.map(({ permission }) => permission),
      }));
    } else {
      data = await paginatedQuery.all();
    }

    return apiQuery.paginate(data, total);
  }

  async findOne(id: bigint) {
    const role = await this.prisma.orm.Role.where({ id }).first();
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async update(id: bigint, body: UpdateRoleDto) {
    const role = await this.findOne(id);

    if (body.scopeType === 'location' && role.scopeType === 'global') {
      const currentPermissions = await this.findPermissions(id);
      const hasGlobalOnlyPermissions = currentPermissions.some(
        (permission) => permission.scopePolicy === 'global_only',
      );
      if (hasGlobalOnlyPermissions) {
        throw new BadRequestException(
          'Cannot change role scope from global to location',
        );
      }
    }

    return this.prisma.orm.Role.where({ id }).update(body);
  }

  async delete(id: bigint) {
    const role = await this.findOne(id);

    if (role.isProtected) {
      throw new ConflictException('Protected role cannot be deleted');
    }

    return this.prisma.orm.Role.where({ id }).delete();
  }

  async findPermissions(roleId: bigint) {
    const role = await this.prisma.orm.Role.where({ id: roleId }).first();
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    const permissions = await this.prisma.orm.RolePermission.where({ roleId })
      .include('permission')
      .all();
    return permissions.map((permission) => permission.permission);
  }

  async syncPermissions(roleId: bigint, body: SyncRolePermissionsDto) {
    const role = await this.prisma.orm.Role.where({ id: roleId }).first();

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.systemKey === 'super_admin') {
      throw new BadRequestException(
        'Super Admin permissions are managed by the system',
      );
    }

    const permissionIds = body.permissionIds;

    const permissions =
      permissionIds.length === 0
        ? []
        : await this.prisma.orm.Permission.where((permission) =>
            permission.id.in(permissionIds),
          ).all();

    if (permissions.length !== permissionIds.length) {
      throw new BadRequestException('One or more permissions do not exist');
    }

    if (role.scopeType === 'location') {
      const invalidPermissions = permissions.filter(
        (permission) => permission.scopePolicy === 'global_only',
      );

      if (invalidPermissions.length > 0) {
        throw new BadRequestException(
          'Location-scoped roles cannot receive global-only permissions',
        );
      }
    }

    await this.prisma.db.transaction(async (tx) => {
      const currentAssignments = await tx.orm.public.RolePermission.where({
        roleId,
      }).all();

      const currentIds = new Set(
        currentAssignments.map((item) => item.permissionId),
      );

      const requestedIds = new Set(permissionIds);

      const toAdd = permissionIds.filter((id) => !currentIds.has(id));

      const toRemove = currentAssignments
        .map((item) => item.permissionId)
        .filter((id) => !requestedIds.has(id));

      if (toRemove.length > 0) {
        await tx.orm.public.RolePermission.where({ roleId })
          .where((assignment) => assignment.permissionId.in(toRemove))
          .deleteAndCount();
      }

      if (toAdd.length > 0) {
        await tx.orm.public.RolePermission.createAndCount(
          toAdd.map((permissionId) => ({
            roleId,
            permissionId,
          })),
        );
      }
    });

    return this.findPermissions(roleId);
  }
}
