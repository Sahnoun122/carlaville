import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';

jest.mock('nanoid', () => ({
  customAlphabet: jest.fn().mockReturnValue(() => 'MOCK_ID'),
}));

describe('ReservationsController', () => {
  let controller: ReservationsController;
  let service: jest.Mocked<Partial<ReservationsService>>;

  beforeEach(async () => {
    const mockReservationsService = {
      create: jest.fn().mockResolvedValue({ id: '1', bookingReference: 'TEST' }),
      findAll: jest.fn().mockResolvedValue({ reservations: [], count: 0 }),
      getDayControlSettings: jest.fn().mockResolvedValue({ minRentalDays: 1 }),
      updateDayControlSettings: jest.fn().mockResolvedValue({ minRentalDays: 2 }),
      findById: jest.fn().mockResolvedValue({ id: '1' }),
      confirm: jest.fn().mockResolvedValue({ id: '1', status: 'CONFIRMED' }),
      reject: jest.fn().mockResolvedValue({ id: '1', status: 'REJECTED' }),
      markPending: jest.fn().mockResolvedValue({ id: '1', status: 'PENDING' }),
      assignDeliveryAgent: jest.fn().mockResolvedValue({ id: '1', assignedDeliveryAgentId: '2' }),
      markReadyForDelivery: jest.fn().mockResolvedValue({ id: '1', status: 'READY_FOR_DELIVERY' }),
      markDelivered: jest.fn().mockResolvedValue({ id: '1', status: 'DELIVERED' }),
      markReturned: jest.fn().mockResolvedValue({ id: '1', status: 'RETURNED' }),
      complete: jest.fn().mockResolvedValue({ id: '1', status: 'COMPLETED' }),
      addInternalNote: jest.fn().mockResolvedValue({ id: '1', internalNotes: 'test' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        {
          provide: ReservationsService,
          useValue: mockReservationsService,
        },
      ],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);
    service = module.get(ReservationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create', async () => {
    expect(await controller.create({} as any)).toEqual({ id: '1', bookingReference: 'TEST' });
    expect(service.create).toHaveBeenCalled();
  });

  it('should call findAll', async () => {
    expect(await controller.findAll({} as any, 1, 10)).toEqual({ reservations: [], count: 0 });
    expect(service.findAll).toHaveBeenCalledWith({}, 1, 10);
  });
});
