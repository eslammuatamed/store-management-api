import { PrismaService } from '../../../database/prisma/prisma.service.js';
import { PermissionsService } from './permissions.service.js';

describe('PermissionsService', () => {
  let service: PermissionsService;
  const all = vi.fn();
  const prismaMock = {
    orm: {
      Permission: {
        all,
      },
    },
  };
  beforeEach(() => {
    vi.clearAllMocks();
    service = new PermissionsService(prismaMock as unknown as PrismaService);
  });

  it('should fetch all permissions', async () => {
    const permissions = [
      {
        id: BigInt(1),
        name: 'test',
        code: 'test',
        scopePolicy: 'global',
        description: 'test',
      },
      {
        id: BigInt(2),
        name: 'test2',
        code: 'test2',
        scopePolicy: 'global',
        description: 'test2',
      },
    ];
    all.mockResolvedValue(permissions);
    const data = await service.findAll();
    expect(data).toEqual(permissions);
    expect(all).toHaveBeenCalledOnce();
  });

  it('should return empty array when no permissions are found', async () => {
    all.mockResolvedValue([]);
    const data = await service.findAll();
    expect(data).toEqual([]);
    expect(all).toHaveBeenCalledOnce();
  });
});
