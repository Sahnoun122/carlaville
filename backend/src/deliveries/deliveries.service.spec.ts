import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { DeliveriesService } from './deliveries.service';
import { Delivery } from './schemas/delivery.schema';
import { Reservation } from '../reservations/schemas/reservation.schema';

class MockDeliveryModel {
  constructor(private data: any) {}
  save() { return Promise.resolve(this.data); }
  static findOne = jest.fn().mockReturnThis();
  static find = jest.fn().mockReturnThis();
  static populate = jest.fn().mockReturnThis();
  static skip = jest.fn().mockReturnThis();
  static limit = jest.fn().mockReturnThis();
  static sort = jest.fn().mockReturnThis();
  static exec = jest.fn().mockResolvedValue(null);
  static countDocuments = jest.fn().mockResolvedValue(0);
  static findById = jest.fn().mockReturnThis();
}

class MockReservationModel {
  constructor(private data: any) {}
  save() { return Promise.resolve(this.data); }
  static findById = jest.fn().mockReturnThis();
  static exec = jest.fn().mockResolvedValue({ id: 'reservation1', save: jest.fn().mockResolvedValue(true) });
}

describe('DeliveriesService', () => {
  let service: DeliveriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveriesService,
        {
          provide: getModelToken(Delivery.name),
          useValue: MockDeliveryModel,
        },
        {
          provide: getModelToken(Reservation.name),
          useValue: MockReservationModel,
        },
      ],
    }).compile();

    service = module.get<DeliveriesService>(DeliveriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should findAll', async () => {
    const res = await service.findAll({} as any, 1, 10);
    expect(res).toBeDefined();
  });
});
