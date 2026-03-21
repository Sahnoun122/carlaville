import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { Reservation } from './schemas/reservation.schema';
import { ReservationDayControl } from './schemas/reservation-day-control.schema';
import { Car } from '../cars/schemas/car.schema';

jest.mock('nanoid', () => ({
  customAlphabet: jest.fn().mockReturnValue(() => 'MOCK_ID'),
}));

class MockReservationModel {
  constructor(private data: any) {}
  save() { return Promise.resolve(this.data); }
  static find = jest.fn().mockReturnThis();
  static populate = jest.fn().mockReturnThis();
  static skip = jest.fn().mockReturnThis();
  static limit = jest.fn().mockReturnThis();
  static sort = jest.fn().mockReturnThis();
  static exec = jest.fn().mockResolvedValue([]);
  static countDocuments = jest.fn().mockResolvedValue(0);
  static findById = jest.fn().mockReturnThis();
  static findByIdAndUpdate = jest.fn().mockReturnThis();
}

class MockReservationDayControlModel {
  constructor(private data: any) {}
  save() { return Promise.resolve(this.data); }
  static findOne = jest.fn().mockReturnThis();
  static exec = jest.fn().mockResolvedValue(null);
}

class MockCarModel {
  static findById = jest.fn().mockReturnThis();
  static select = jest.fn().mockReturnThis();
  static exec = jest.fn().mockResolvedValue({ id: '1', minRentalDays: 1, dailyPrice: 50 });
}

describe('ReservationsService', () => {
  let service: ReservationsService;
  let model: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: getModelToken(Reservation.name),
          useValue: MockReservationModel,
        },
        {
          provide: getModelToken(ReservationDayControl.name),
          useValue: MockReservationDayControlModel,
        },
        {
          provide: getModelToken(Car.name),
          useValue: MockCarModel,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    model = module.get(getModelToken(Reservation.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return reservations and count', async () => {
      const result = await service.findAll({} as any, 1, 10);
      expect(result).toEqual({ reservations: [], count: 0 });
      expect(model.find).toHaveBeenCalled();
    });
  });
});
