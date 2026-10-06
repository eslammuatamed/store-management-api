import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsController } from './permissions.controller.js';
import { PermissionsService } from './permissions.service.js';
import { Varchar } from '@prisma/orm-postgres/target/codec-types';

describe('PermissionsController', () => {
  let controller: PermissionsController;

  const findAll = vi.fn();

  const permissionsServiceMock = {
    findAll,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsController],
      providers: [
        {
          provide: PermissionsService,
          useValue: permissionsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<PermissionsController>(PermissionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all permissions', async () => {
    const permissions = [
      {
        id: BigInt(1),
        code: 'permission1' as Varchar<100>,
        description: 'description1' as Varchar<500>,
        scopePolicy: 'global_only' as const,
        createdAt: new Date(),
      },
      {
        id: BigInt(2),
        code: 'permission2' as Varchar<100>,
        description: 'description2' as Varchar<500>,
        scopePolicy: 'global_only' as const,
        createdAt: new Date(),
      },
    ];

    findAll.mockResolvedValue(permissions);

    const result = await controller.findAll();

    expect(result).toEqual(permissions);
    expect(findAll).toHaveBeenCalledOnce();
  });
});
