import { Test, TestingModule } from '@nestjs/testing';
import { CarsController } from './cars.controller';
import { CarsService } from './cars.service';

describe('CarsController', () => {
  let controller: CarsController;
  let service: jest.Mocked<Partial<CarsService>>;

  beforeEach(async () => {
    const mockCarsService = {
      create: jest.fn().mockResolvedValue({ id: '1', brand: 'Toyota' }),
      findAll: jest.fn().mockResolvedValue({ cars: [], count: 0 }),
      findById: jest.fn().mockResolvedValue({ id: '1', brand: 'Toyota' }),
      update: jest.fn().mockResolvedValue({ id: '1', brand: 'Toyota' }),
      archive: jest.fn().mockResolvedValue({ id: '1', active: false }),
      startMaintenance: jest.fn().mockResolvedValue({ id: '1', status: 'maintenance' }),
      completeMaintenance: jest.fn().mockResolvedValue({ id: '1', status: 'available' }),
      getMaintenanceHistory: jest.fn().mockResolvedValue({ history: [] }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarsController],
      providers: [
        {
          provide: CarsService,
          useValue: mockCarsService,
        },
      ],
    }).compile();

    controller = module.get<CarsController>(CarsController);
    service = module.get(CarsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create', async () => {
    expect(await controller.create({} as any)).toEqual({ id: '1', brand: 'Toyota' });
    expect(service.create).toHaveBeenCalled();
  });

  it('should call findAll', async () => {
    expect(await controller.findAll({} as any, 1, 10)).toEqual({ cars: [], count: 0 });
    expect(service.findAll).toHaveBeenCalledWith({}, 1, 10);
  });
});
