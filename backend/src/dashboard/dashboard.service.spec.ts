import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { Reservation } from '../reservations/schemas/reservation.schema';
import { Car } from '../cars/schemas/car.schema';

class MockReservationModel {
  static countDocuments = jest.fn().mockResolvedValue(0);
  static find = jest.fn().mockReturnThis();
  static sort = jest.fn().mockReturnThis();
  static limit = jest.fn().mockReturnThis();
  static select = jest.fn().mockReturnThis();
  static lean = jest.fn().mockResolvedValue([]);
  static aggregate = jest.fn().mockResolvedValue([]);
}

class MockCarModel {
  static countDocuments = jest.fn().mockResolvedValue(0);
}

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getModelToken(Reservation.name),
          useValue: MockReservationModel,
        },
        {
          provide: getModelToken(Car.name),
          useValue: MockCarModel,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should getReservationManagerStats', async () => {
    const res = await service.getReservationManagerStats();
    expect(res).toBeDefined();
  });
});
