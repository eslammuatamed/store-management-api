import { RolesService } from './roles.service.js';
import { PrismaService } from '../../../database/prisma/prisma.service.js';
import { Varchar } from '@prisma/orm-postgres/target/codec-types';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { RoleQueryDto } from './schemas/role-query.schema.js';

describe('RolesService', () => {
  let service: RolesService;
  const createRole = vi.fn();
  const firstRole = vi.fn();
  const deleteRole = vi.fn();
  const updateRole = vi.fn();
  const whereRole = vi.fn();

  const allRolePermissions = vi.fn();
  const includeRolePermission = vi.fn(() => ({
    all: allRolePermissions,
  }));

  const whereRolePermission = vi.fn(() => ({
    include: includeRolePermission,
  }));

  const allPermissions = vi.fn();
  const wherePermission = vi.fn(() => ({
    all: allPermissions,
  }));

  const transaction = vi.fn();

  const allRoles = vi.fn();

  const allRolesWithPermissions = vi.fn();

  const includePaginatedRoles = vi.fn(() => ({
    all: allRolesWithPermissions,
  }));

  const limitRoles = vi.fn(() => ({
    all: allRoles,
    include: includePaginatedRoles,
  }));

  const offsetRoles = vi.fn(() => ({
    limit: limitRoles,
  }));

  const selectRoles = vi.fn(() => ({
    offset: offsetRoles,
  }));

  const orderByRoles = vi.fn(() => ({
    select: selectRoles,
  }));

  const aggregateRoles = vi.fn();
  const searchRolesQuery = {
    aggregate: aggregateRoles,
    orderBy: orderByRoles,
  };

  const prismaMock = {
    db: {
      transaction,
    },
    orm: {
      Role: {
        create: createRole,
        where: whereRole,
        aggregate: aggregateRoles,
        orderBy: orderByRoles,
      },
      RolePermission: {
        where: whereRolePermission,
      },
      Permission: {
        where: wherePermission,
      },
    },
  };

  const allTransactionRolePermissions = vi.fn();

  const deleteAndCount = vi.fn();
  const createAndCount = vi.fn();
  const secondWhereTransactionRolePermission = vi.fn(
    (
      _callback: (assignment: {
        permissionId: {
          in: (ids: bigint[]) => unknown;
        };
      }) => unknown,
    ) => ({
      deleteAndCount,
    }),
  );

  const whereTransactionRolePermission = vi.fn(() => ({
    all: allTransactionRolePermissions,
    where: secondWhereTransactionRolePermission,
  }));

  const txMock = {
    orm: {
      public: {
        RolePermission: {
          where: whereTransactionRolePermission,
          createAndCount,
        },
      },
    },
  };

  const makeRole = (overrides = {}) => ({
    id: BigInt(1),
    name: 'test' as Varchar<120>,
    description: 'test' as Varchar<500>,
    scopeType: 'global' as const,
    isProtected: false,
    ...overrides,
  });

  const makePermission = (overrides = {}) => ({
    id: BigInt(1),
    code: 'roles.read' as Varchar<100>,
    description: 'test' as Varchar<500>,
    scopePolicy: 'global_only' as const,
    createdAt: new Date().toISOString(),
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    transaction.mockImplementation(async (callback) => {
      return callback(txMock);
    });
    whereRole.mockReturnValue({
      first: firstRole,
      delete: deleteRole,
      update: updateRole,
    });
    service = new RolesService(prismaMock as unknown as PrismaService);
  });

  describe('create role', () => {
    it('should create a role', async () => {
      const role = {
        name: 'test' as Varchar<120>,
        description: 'test' as Varchar<500>,
        scopeType: 'global' as const,
      };

      const expectedRole = {
        id: BigInt(1),
        ...role,
      };

      createRole.mockResolvedValue(expectedRole);
      firstRole.mockResolvedValue(null);

      const data = await service.create(role);

      expect(data).toEqual(expectedRole);
      expect(createRole).toHaveBeenCalledWith(role);
      expect(createRole).toHaveBeenCalledOnce();
    });

    it('should not create role if role with same name already exists', async () => {
      const role = {
        name: 'test' as Varchar<120>,
        description: 'test' as Varchar<500>,
        scopeType: 'global' as const,
      };

      firstRole.mockResolvedValue({
        id: BigInt(1),
        ...role,
      });

      await expect(service.create(role)).rejects.toThrow(ConflictException);
      expect(whereRole).toHaveBeenCalledWith({ name: role.name });
      expect(firstRole).toHaveBeenCalledOnce();
      expect(createRole).not.toHaveBeenCalled();
    });
  });

  describe('find role', () => {
    it('should return role by id', async () => {
      const id = BigInt(1);
      const role = makeRole();
      firstRole.mockResolvedValue(role);
      const data = await service.findOne(id);
      expect(data).toEqual(role);
      expect(whereRole).toHaveBeenCalledWith({ id });
      expect(firstRole).toHaveBeenCalledOnce();
    });

    it('should not return role if role with same id does not exist', async () => {
      const id = BigInt(1);
      firstRole.mockResolvedValue(null);
      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      expect(whereRole).toHaveBeenCalledWith({ id });
      expect(firstRole).toHaveBeenCalledOnce();
    });
  });

  describe('delete role', () => {
    it('should delete role', async () => {
      const id = BigInt(1);
      const role = makeRole({
        isProtected: false,
      });
      firstRole.mockResolvedValue(role);
      deleteRole.mockResolvedValue(role);
      const data = await service.delete(id);
      expect(data).toEqual(role);
      expect(whereRole).toHaveBeenCalledWith({ id });
      expect(firstRole).toHaveBeenCalledOnce();
      expect(deleteRole).toHaveBeenCalledOnce();
      expect(whereRole).toHaveBeenCalledTimes(2);
    });

    it('should not delete role if role is protected', async () => {
      const id = BigInt(1);
      const role = makeRole({
        isProtected: true,
      });
      firstRole.mockResolvedValue(role);
      await expect(service.delete(id)).rejects.toThrow(ConflictException);
      expect(whereRole).toHaveBeenCalledWith({ id });
      expect(firstRole).toHaveBeenCalledOnce();
      expect(whereRole).toHaveBeenCalledOnce();
      expect(deleteRole).not.toHaveBeenCalled();
    });
  });

  describe('update role', () => {
    it('should update role', async () => {
      const id = BigInt(1);
      const role = makeRole({
        id,
        isProtected: false,
      });
      const body = {
        name: 'new test' as Varchar<120>,
      };
      firstRole.mockResolvedValueOnce(role).mockResolvedValueOnce(null);
      updateRole.mockResolvedValue({
        ...role,
        ...body,
      });
      const newRole = await service.update(id, body);
      expect(newRole).toEqual({
        ...role,
        ...body,
      });
      expect(whereRole).toHaveBeenCalledWith({ id });
      expect(whereRole).toHaveBeenCalledTimes(3);
      expect(firstRole).toHaveBeenCalledTimes(2);
      expect(updateRole).toHaveBeenCalledOnce();
      expect(updateRole).toHaveBeenCalledWith(body);
    });

    it('should throw error when changing global role to location with global-only permissions', async () => {
      const findPermissionsSpy = vi
        .spyOn(service, 'findPermissions')
        .mockResolvedValue([makePermission()]);
      const id = BigInt(1);
      const role = makeRole({
        isProtected: false,
      });
      const body = {
        scopeType: 'location' as const,
      };
      firstRole.mockResolvedValue(role);
      await expect(service.update(id, body)).rejects.toThrow(
        BadRequestException,
      );
      expect(findPermissionsSpy).toHaveBeenCalledWith(id);
      expect(findPermissionsSpy).toHaveBeenCalledOnce();
      expect(whereRole).toHaveBeenCalledWith({ id });
      expect(firstRole).toHaveBeenCalledOnce();
      expect(updateRole).not.toHaveBeenCalled();
    });

    it('should update scopeType to location if no permissions with global_only scope policy exist', async () => {
      const findPermissionsSpy = vi
        .spyOn(service, 'findPermissions')
        .mockResolvedValue([
          makePermission({
            scopePolicy: 'location_or_global',
          }),
        ]);
      const id = BigInt(1);
      const role = makeRole({
        isProtected: false,
      });
      const body = {
        scopeType: 'location' as const,
      };

      const updatedRole = {
        ...role,
        ...body,
      };

      firstRole.mockResolvedValue(role);
      updateRole.mockResolvedValue(updatedRole);

      const newRole = await service.update(id, body);
      expect(newRole).toEqual(updatedRole);
      expect(findPermissionsSpy).toHaveBeenCalledWith(id);
      expect(findPermissionsSpy).toHaveBeenCalledOnce();
      expect(whereRole).toHaveBeenCalledWith({ id });
      expect(whereRole).toHaveBeenCalledTimes(2);
      expect(firstRole).toHaveBeenCalledOnce();
      expect(updateRole).toHaveBeenCalledOnce();
      expect(updateRole).toHaveBeenCalledWith(body);
    });

    it('should not update role name if another role with same name exists', async () => {
      const id = BigInt(2);

      const role = makeRole({
        id,
        isProtected: false,
      });

      firstRole.mockResolvedValueOnce(role).mockResolvedValueOnce(
        makeRole({
          isProtected: false,
        }),
      );

      const body = {
        name: 'Manager' as Varchar<120>,
      };

      await expect(service.update(id, body)).rejects.toThrow(ConflictException);

      expect(updateRole).not.toHaveBeenCalled();
    });
  });

  describe('role permissions', () => {
    it('should return role permissions', async () => {
      const id = BigInt(1);
      const role = makeRole({
        id,
      });
      firstRole.mockResolvedValue(role);

      const permissions = [makePermission()];

      allRolePermissions.mockResolvedValue([
        {
          roleId: id,
          permissionId: BigInt(1),
          permission: permissions[0],
        },
      ]);

      const data = await service.findPermissions(id);
      expect(data).toEqual(permissions);
      expect(whereRole).toHaveBeenCalledWith({ id });
      expect(whereRole).toHaveBeenCalledOnce();
      expect(firstRole).toHaveBeenCalledOnce();
      expect(whereRolePermission).toHaveBeenCalledWith({ roleId: id });
      expect(whereRolePermission).toHaveBeenCalledOnce();
      expect(allRolePermissions).toHaveBeenCalledOnce();
      expect(includeRolePermission).toHaveBeenCalledWith('permission');
    });

    it('should throw error if role does not exist when finding permissions', async () => {
      const id = BigInt(1);
      firstRole.mockResolvedValue(null);
      await expect(service.findPermissions(id)).rejects.toThrow(
        NotFoundException,
      );
      expect(whereRole).toHaveBeenCalledWith({ id });
      expect(whereRole).toHaveBeenCalledOnce();
      expect(firstRole).toHaveBeenCalledOnce();
      expect(whereRolePermission).not.toHaveBeenCalled();
    });
  });

  describe('sync permissions', () => {
    it('should not sync permissions if role does not exist', async () => {
      const id = BigInt(1);
      const body = {
        permissionIds: [BigInt(1)],
      };
      firstRole.mockResolvedValue(null);
      await expect(service.syncPermissions(id, body)).rejects.toThrow(
        NotFoundException,
      );
      expect(whereRole).toHaveBeenCalledWith({ id });
      expect(firstRole).toHaveBeenCalledOnce();
    });

    it('should not sync permissions if role has systemKey super_admin', async () => {
      const id = BigInt(1);
      const role = makeRole({
        id,
        systemKey: 'super_admin' as const,
      });
      const body = {
        permissionIds: [BigInt(1)],
      };
      firstRole.mockResolvedValue(role);
      await expect(service.syncPermissions(id, body)).rejects.toThrow(
        BadRequestException,
      );
      expect(whereRole).toHaveBeenCalledWith({ id });
      expect(firstRole).toHaveBeenCalledOnce();
    });

    it('should not sync permissions if one or more permissions do not exist', async () => {
      const id = BigInt(1);
      const body = {
        permissionIds: [BigInt(1), BigInt(2)],
      };
      firstRole.mockResolvedValue(
        makeRole({
          id,
        }),
      );
      allPermissions.mockResolvedValue([
        makePermission({
          id: BigInt(1),
        }),
      ]);
      await expect(service.syncPermissions(id, body)).rejects.toThrow(
        BadRequestException,
      );
      expect(whereRole).toHaveBeenCalledWith({ id });
      expect(firstRole).toHaveBeenCalledOnce();
      expect(wherePermission).toHaveBeenCalledWith(expect.any(Function));
      expect(wherePermission).toHaveBeenCalledOnce();
      expect(allPermissions).toHaveBeenCalledOnce();
      expect(transaction).not.toHaveBeenCalled();
    });

    it('should not sync permissions if role has location scopeType and some of permissions has global_only scopePolicy', async () => {
      const id = BigInt(1);
      const role = makeRole({
        id,
        scopeType: 'location' as const,
      });
      const body = {
        permissionIds: [BigInt(1)],
      };
      firstRole.mockResolvedValue(role);
      allPermissions.mockResolvedValue([
        makePermission({
          id: BigInt(1),
          scopePolicy: 'global_only' as const,
        }),
      ]);
      await expect(service.syncPermissions(id, body)).rejects.toThrow(
        BadRequestException,
      );
      expect(whereRole).toHaveBeenCalledWith({ id });
      expect(firstRole).toHaveBeenCalledOnce();
      expect(wherePermission).toHaveBeenCalledWith(expect.any(Function));
      expect(wherePermission).toHaveBeenCalledOnce();
      expect(allPermissions).toHaveBeenCalledOnce();
      expect(transaction).not.toHaveBeenCalled();
    });

    it('should sync permissions without adding or removing when permissions are already assigned', async () => {
      const id = BigInt(1);

      const body = {
        permissionIds: [BigInt(1)],
      };

      firstRole.mockResolvedValue(
        makeRole({
          id,
        }),
      );

      const permissions = [makePermission()];
      allPermissions.mockResolvedValue(permissions);
      const findPermissionsSpy = vi
        .spyOn(service, 'findPermissions')
        .mockResolvedValue(permissions);

      allTransactionRolePermissions.mockResolvedValue([
        {
          roleId: id,
          permissionId: BigInt(1),
        },
      ]);

      const data = await service.syncPermissions(id, body);
      expect(data).toEqual(permissions);
      expect(deleteAndCount).not.toHaveBeenCalled();
      expect(createAndCount).not.toHaveBeenCalled();
      expect(findPermissionsSpy).toHaveBeenCalledWith(id);
      expect(findPermissionsSpy).toHaveBeenCalledOnce();
    });

    it('should sync permissions with adding permissions only', async () => {
      const id = BigInt(1);

      const body = {
        permissionIds: [BigInt(1), BigInt(2)],
      };

      firstRole.mockResolvedValue(
        makeRole({
          id,
        }),
      );

      const permissions = [
        makePermission({ id: BigInt(1) }),
        makePermission({ id: BigInt(2) }),
      ];
      allPermissions.mockResolvedValue(permissions);
      const findPermissionsSpy = vi
        .spyOn(service, 'findPermissions')
        .mockResolvedValue(permissions);

      allTransactionRolePermissions.mockResolvedValue([
        {
          roleId: id,
          permissionId: BigInt(1),
        },
      ]);

      const data = await service.syncPermissions(id, body);
      expect(data).toEqual(permissions);
      expect(transaction).toHaveBeenCalledOnce();
      expect(deleteAndCount).not.toHaveBeenCalled();
      expect(createAndCount).toHaveBeenCalledWith([
        {
          roleId: id,
          permissionId: BigInt(2),
        },
      ]);
      expect(createAndCount).toHaveBeenCalledOnce();
      expect(findPermissionsSpy).toHaveBeenCalledWith(id);
      expect(findPermissionsSpy).toHaveBeenCalledOnce();
    });

    it('should sync permissions with removing permissions only', async () => {
      const id = BigInt(1);

      const body = {
        permissionIds: [BigInt(1)],
      };

      firstRole.mockResolvedValue(
        makeRole({
          id,
        }),
      );

      const permissions = [
        makePermission({
          id: BigInt(1),
        }),
      ];
      allPermissions.mockResolvedValue(permissions);
      const findPermissionsSpy = vi
        .spyOn(service, 'findPermissions')
        .mockResolvedValue(permissions);

      allTransactionRolePermissions.mockResolvedValue([
        {
          roleId: id,
          permissionId: BigInt(1),
        },
        {
          roleId: id,
          permissionId: BigInt(2),
        },
      ]);

      const data = await service.syncPermissions(id, body);
      expect(data).toEqual(permissions);
      expect(transaction).toHaveBeenCalledOnce();
      expect(secondWhereTransactionRolePermission).toHaveBeenCalledWith(
        expect.any(Function),
      );
      expect(secondWhereTransactionRolePermission).toHaveBeenCalledOnce();
      expect(deleteAndCount).toHaveBeenCalledOnce();
      expect(createAndCount).not.toHaveBeenCalled();
      expect(findPermissionsSpy).toHaveBeenCalledWith(id);
      expect(findPermissionsSpy).toHaveBeenCalledOnce();

      const whereCallback =
        secondWhereTransactionRolePermission.mock.calls[0][0];
      const inFn = vi.fn();
      whereCallback({
        permissionId: {
          in: inFn,
        },
      });
      expect(inFn).toHaveBeenCalledWith([BigInt(2)]);
    });

    it('should sync permissions with adding and removing permissions', async () => {
      const id = BigInt(1);

      const body = {
        permissionIds: [BigInt(2), BigInt(3)],
      };

      firstRole.mockResolvedValue(
        makeRole({
          id,
        }),
      );

      const permissions = [
        makePermission({
          id: BigInt(2),
        }),
        makePermission({
          id: BigInt(3),
        }),
      ];
      allPermissions.mockResolvedValue(permissions);
      const findPermissionsSpy = vi
        .spyOn(service, 'findPermissions')
        .mockResolvedValue(permissions);

      allTransactionRolePermissions.mockResolvedValue([
        {
          roleId: id,
          permissionId: BigInt(1),
        },
        {
          roleId: id,
          permissionId: BigInt(2),
        },
      ]);

      const data = await service.syncPermissions(id, body);
      expect(data).toEqual(permissions);
      expect(transaction).toHaveBeenCalledOnce();
      expect(whereTransactionRolePermission).toHaveBeenCalledWith({
        roleId: id,
      });
      expect(whereTransactionRolePermission).toHaveBeenCalledTimes(2);
      expect(secondWhereTransactionRolePermission).toHaveBeenCalledWith(
        expect.any(Function),
      );
      expect(secondWhereTransactionRolePermission).toHaveBeenCalledOnce();
      expect(deleteAndCount).toHaveBeenCalledOnce();
      expect(createAndCount).toHaveBeenCalledWith([
        {
          roleId: id,
          permissionId: BigInt(3),
        },
      ]);
      expect(createAndCount).toHaveBeenCalledOnce();
      expect(findPermissionsSpy).toHaveBeenCalledWith(id);
      expect(findPermissionsSpy).toHaveBeenCalledOnce();

      const whereCallback =
        secondWhereTransactionRolePermission.mock.calls[0][0];
      const inFn = vi.fn();
      whereCallback({
        permissionId: {
          in: inFn,
        },
      });
      expect(inFn).toHaveBeenCalledWith([BigInt(1)]);
    });

    it('should remove all permissions when permissionIds is empty', async () => {
      const id = BigInt(1);

      const body = {
        permissionIds: [],
      };

      firstRole.mockResolvedValue(
        makeRole({
          id,
        }),
      );

      allTransactionRolePermissions.mockResolvedValue([
        {
          roleId: id,
          permissionId: BigInt(1),
        },
        {
          roleId: id,
          permissionId: BigInt(2),
        },
      ]);
      const findPermissionsSpy = vi
        .spyOn(service, 'findPermissions')
        .mockResolvedValue([]);
      const data = await service.syncPermissions(id, body);
      expect(data).toEqual([]);
      expect(wherePermission).not.toHaveBeenCalled();
      expect(transaction).toHaveBeenCalledOnce();
      expect(createAndCount).not.toHaveBeenCalled();
      expect(deleteAndCount).toHaveBeenCalledOnce();
      expect(secondWhereTransactionRolePermission).toHaveBeenCalledOnce();

      const whereCallback =
        secondWhereTransactionRolePermission.mock.calls[0][0];
      const inFn = vi.fn();
      whereCallback({
        permissionId: {
          in: inFn,
        },
      });
      expect(inFn).toHaveBeenCalledWith([BigInt(1), BigInt(2)]);
      expect(findPermissionsSpy).toHaveBeenCalledOnce();
      expect(findPermissionsSpy).toHaveBeenCalledWith(id);
    });
  });

  describe('find all', () => {
    it('should return paginated roles', async () => {
      const query: RoleQueryDto = {
        fields: ['id', 'name'],
        sort: {
          field: 'name',
          direction: 'asc',
        },
        page: 1,
        perPage: 20,
      };

      const roles = [
        {
          id: BigInt(1),
          name: 'Admin',
        },
        {
          id: BigInt(2),
          name: 'Manager',
        },
      ];

      aggregateRoles.mockResolvedValue({
        total: 2,
      });

      allRoles.mockResolvedValue(roles);

      const result = await service.findAll(query);

      expect(result).toEqual({
        data: roles,
        meta: {
          page: 1,
          perPage: 20,
          total: 2,
          totalPages: 1,
        },
      });

      expect(aggregateRoles).toHaveBeenCalledOnce();

      expect(selectRoles).toHaveBeenCalledWith('id', 'name');
      expect(offsetRoles).toHaveBeenCalledWith(0);
      expect(limitRoles).toHaveBeenCalledWith(20);
      expect(allRoles).toHaveBeenCalledOnce();
    });

    it('should calculate pagination for another page', async () => {
      const query: RoleQueryDto = {
        fields: ['id', 'name'],
        sort: {
          field: 'name',
          direction: 'asc',
        },
        page: 3,
        perPage: 10,
      };

      aggregateRoles.mockResolvedValue({
        total: 25,
      });

      allRoles.mockResolvedValue([]);

      const result = await service.findAll(query);

      expect(offsetRoles).toHaveBeenCalledWith(20);
      expect(limitRoles).toHaveBeenCalledWith(10);

      expect(result.meta).toEqual({
        page: 3,
        perPage: 10,
        total: 25,
        totalPages: 3,
      });
    });

    it('should apply search when search value exists', async () => {
      const query: RoleQueryDto = {
        fields: ['id', 'name'],
        sort: {
          field: 'name',
          direction: 'asc',
        },
        search: 'admin',
        page: 1,
        perPage: 20,
      };

      const roles = [
        {
          id: BigInt(1),
          name: 'Admin',
        },
      ];

      whereRole.mockReturnValueOnce(searchRolesQuery);

      aggregateRoles.mockResolvedValue({
        total: 1,
      });

      allRoles.mockResolvedValue(roles);

      const result = await service.findAll(query);

      expect(whereRole).toHaveBeenCalledOnce();
      expect(whereRole).toHaveBeenCalledWith(expect.any(Function));

      expect(result.data).toEqual(roles);
    });

    it('should include permissions when requested', async () => {
      const query: RoleQueryDto = {
        fields: ['id', 'name'],
        include: ['permissions'],
        sort: {
          field: 'name',
          direction: 'asc',
        },
        page: 1,
        perPage: 20,
      };

      aggregateRoles.mockResolvedValue({
        total: 1,
      });

      allRolesWithPermissions.mockResolvedValue([
        {
          id: BigInt(1),
          name: 'Admin',
          rolePermissions: [
            {
              permission: {
                id: BigInt(1),
                code: 'roles.read',
                scopePolicy: 'global_only',
              },
            },
            {
              permission: {
                id: BigInt(2),
                code: 'roles.create',
                scopePolicy: 'global_only',
              },
            },
          ],
        },
      ]);

      const result = await service.findAll(query);

      expect(includePaginatedRoles).toHaveBeenCalledWith(
        'rolePermissions',
        expect.any(Function),
      );

      expect(result.data).toEqual([
        {
          id: BigInt(1),
          name: 'Admin',
          permissions: [
            {
              id: BigInt(1),
              code: 'roles.read',
              scopePolicy: 'global_only',
            },
            {
              id: BigInt(2),
              code: 'roles.create',
              scopePolicy: 'global_only',
            },
          ],
        },
      ]);

      expect(allRoles).not.toHaveBeenCalled();
      expect(allRolesWithPermissions).toHaveBeenCalledOnce();
    });
  });
});
