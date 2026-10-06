import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller.js';
import { RolesService } from './roles.service.js';
import { Varchar } from '@prisma/orm-postgres/target/codec-types';
import { RoleQueryDto } from './schemas/role-query.schema.js';

describe('RolesController', () => {
  let controller: RolesController;

  const rolesServiceMock = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findPermissions: vi.fn(),
    syncPermissions: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: rolesServiceMock,
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create role through service', async () => {
      const body = {
        name: 'Manager' as Varchar<120>,
        description: 'test' as Varchar<500>,
        scopeType: 'global' as const,
      };

      const role = {
        id: BigInt(1),
        ...body,
      };

      rolesServiceMock.create.mockResolvedValue(role);

      const result = await controller.create(body);

      expect(result).toEqual(role);
      expect(rolesServiceMock.create).toHaveBeenCalledWith(body);
      expect(rolesServiceMock.create).toHaveBeenCalledOnce();
    });
  });

  describe('findAll', () => {
    it('should return roles through service', async () => {
      const query: RoleQueryDto = {
        fields: ['id', 'name'],
        sort: {
          field: 'name',
          direction: 'asc',
        },
        page: 1,
        perPage: 20,
      };

      const response = {
        data: [
          {
            id: BigInt(1),
            name: 'Manager',
          },
        ],
        meta: {
          page: 1,
          perPage: 20,
          total: 1,
          totalPages: 1,
        },
      };

      rolesServiceMock.findAll.mockResolvedValue(response);

      const result = await controller.findAll(query);

      expect(result).toEqual(response);
      expect(rolesServiceMock.findAll).toHaveBeenCalledWith(query);
      expect(rolesServiceMock.findAll).toHaveBeenCalledOnce();
    });
  });

  describe('findOne', () => {
    it('should return role through service', async () => {
      const id = 1n;

      const role = {
        id,
        name: 'Manager',
        scopeType: 'global' as const,
      };

      rolesServiceMock.findOne.mockResolvedValue(role);

      const result = await controller.findOne(id);

      expect(result).toEqual(role);
      expect(rolesServiceMock.findOne).toHaveBeenCalledWith(id);
      expect(rolesServiceMock.findOne).toHaveBeenCalledOnce();
    });
  });

  describe('update', () => {
    it('should update role through service', async () => {
      const id = BigInt(1);

      const body = {
        name: 'New Manager' as Varchar<120>,
      };

      const role = {
        id,
        name: 'New Manager',
        scopeType: 'global' as const,
      };

      rolesServiceMock.update.mockResolvedValue(role);

      const result = await controller.update(id, body);

      expect(result).toEqual(role);
      expect(rolesServiceMock.update).toHaveBeenCalledWith(id, body);
      expect(rolesServiceMock.update).toHaveBeenCalledOnce();
    });
  });

  describe('delete', () => {
    it('should delete role through service', async () => {
      const id = 1n;

      const role = {
        id,
        name: 'Manager',
        scopeType: 'global' as const,
      };

      rolesServiceMock.delete.mockResolvedValue(role);

      const result = await controller.delete(id);

      expect(result).toEqual(role);
      expect(rolesServiceMock.delete).toHaveBeenCalledWith(id);
      expect(rolesServiceMock.delete).toHaveBeenCalledOnce();
    });
  });

  describe('findPermissions', () => {
    it('should return role permissions through service', async () => {
      const id = 1n;

      const permissions = [
        {
          id: 1n,
          code: 'roles.read',
          scopePolicy: 'global_only' as const,
        },
      ];

      rolesServiceMock.findPermissions.mockResolvedValue(permissions);

      const result = await controller.findPermissions(id);

      expect(result).toEqual(permissions);

      expect(rolesServiceMock.findPermissions).toHaveBeenCalledWith(id);

      expect(rolesServiceMock.findPermissions).toHaveBeenCalledOnce();
    });
  });

  describe('syncPermissions', () => {
    it('should sync role permissions through service', async () => {
      const id = 1n;

      const body = {
        permissionIds: [1n, 2n],
      };

      const permissions = [
        {
          id: 1n,
          code: 'roles.read',
          scopePolicy: 'global_only' as const,
        },
        {
          id: 2n,
          code: 'roles.create',
          scopePolicy: 'global_only' as const,
        },
      ];

      rolesServiceMock.syncPermissions.mockResolvedValue(permissions);

      const result = await controller.syncPermissions(id, body);

      expect(result).toEqual(permissions);

      expect(rolesServiceMock.syncPermissions).toHaveBeenCalledWith(id, body);

      expect(rolesServiceMock.syncPermissions).toHaveBeenCalledOnce();
    });
  });
});
