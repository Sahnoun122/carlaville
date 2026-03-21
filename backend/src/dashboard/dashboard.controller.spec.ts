import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: jest.Mocked<Partial<DashboardService>>;

  beforeEach(async () => {
    const mockDashboardService = {
      getReservationManagerStats: jest.fn().mockResolvedValue({ reservations: {}, maintenance: {}, recentReservations: [], revenue: [] }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: mockDashboardService,
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get(DashboardService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call getReservationManagerDashboard', async () => {
    expect(await controller.getReservationManagerDashboard()).toBeDefined();
    expect(service.getReservationManagerStats).toHaveBeenCalled();
  });
});
