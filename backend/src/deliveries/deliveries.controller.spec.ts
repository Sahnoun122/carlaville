import { Test, TestingModule } from '@nestjs/testing';
import { DeliveriesController } from './deliveries.controller';
import { DeliveriesService } from './deliveries.service';

describe('DeliveriesController', () => {
  let controller: DeliveriesController;
  let service: jest.Mocked<Partial<DeliveriesService>>;

  beforeEach(async () => {
    const mockDeliveriesService = {
      findAll: jest.fn().mockResolvedValue({ deliveries: [], count: 0 }),
      create: jest.fn().mockResolvedValue({ id: '1', reservationId: 'R1' }),
      findMine: jest.fn().mockResolvedValue({ deliveries: [], count: 0 }),
      updateStatusByAgent: jest.fn().mockResolvedValue({ id: '1', status: 'CONFIRMED' }),
      findById: jest.fn().mockResolvedValue({ id: '1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveriesController],
      providers: [
        {
          provide: DeliveriesService,
          useValue: mockDeliveriesService,
        },
      ],
    }).compile();

    controller = module.get<DeliveriesController>(DeliveriesController);
    service = module.get(DeliveriesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create', async () => {
    expect(await controller.create({} as any)).toEqual({ id: '1', reservationId: 'R1' });
    expect(service.create).toHaveBeenCalled();
  });

  it('should call findAllAdmin', async () => {
    expect(await controller.findAllAdmin({} as any, 1, 10)).toEqual({ deliveries: [], count: 0 });
    expect(service.findAll).toHaveBeenCalledWith({}, 1, 10);
  });
});
