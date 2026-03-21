import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<Partial<UsersService>>;

  beforeEach(async () => {
    const mockUsersService = {
      create: jest.fn().mockResolvedValue({ id: '1', email: 'test@t.com' }),
      findAll: jest.fn().mockResolvedValue({ users: [], count: 0 }),
      findById: jest.fn().mockResolvedValue({ id: '1', email: 'test@t.com' }),
      update: jest.fn().mockResolvedValue({ id: '1', email: 'updated@t.com' }),
      activate: jest.fn().mockResolvedValue({ id: '1', active: true }),
      deactivate: jest.fn().mockResolvedValue({ id: '1', active: false }),
      assignRole: jest.fn().mockResolvedValue({ id: '1', role: 'ADMIN' }),
      remove: jest.fn().mockResolvedValue({ message: 'User deleted successfully' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create', async () => {
    expect(await controller.create({} as any)).toEqual({ id: '1', email: 'test@t.com' });
    expect(service.create).toHaveBeenCalled();
  });

  it('should call findAll', async () => {
    expect(await controller.findAll({} as any, 1, 10)).toEqual({ users: [], count: 0 });
    expect(service.findAll).toHaveBeenCalledWith({}, 1, 10);
  });
});
