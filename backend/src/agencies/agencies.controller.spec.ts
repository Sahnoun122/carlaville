import { Test, TestingModule } from '@nestjs/testing';
import { AgenciesController } from './agencies.controller';
import { AgenciesService } from './agencies.service';

describe('AgenciesController', () => {
  let controller: AgenciesController;
  let service: jest.Mocked<Partial<AgenciesService>>;

  beforeEach(async () => {
    const mockAgenciesService = {
      create: jest.fn().mockResolvedValue({ id: '1', name: 'Test Agency' }),
      findAll: jest.fn().mockResolvedValue({ agencies: [], count: 0 }),
      findById: jest.fn().mockResolvedValue({ id: '1', name: 'Test Agency' }),
      update: jest.fn().mockResolvedValue({ id: '1', name: 'Test Agency' }),
      activate: jest.fn().mockResolvedValue({ id: '1', active: true }),
      deactivate: jest.fn().mockResolvedValue({ id: '1', active: false }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgenciesController],
      providers: [
        {
          provide: AgenciesService,
          useValue: mockAgenciesService,
        },
      ],
    }).compile();

    controller = module.get<AgenciesController>(AgenciesController);
    service = module.get(AgenciesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create', async () => {
    expect(await controller.create({} as any)).toEqual({ id: '1', name: 'Test Agency' });
    expect(service.create).toHaveBeenCalled();
  });

  it('should call findAll', async () => {
    expect(await controller.findAll({} as any, 1, 10)).toEqual({ agencies: [], count: 0 });
    expect(service.findAll).toHaveBeenCalledWith({}, 1, 10);
  });
});
