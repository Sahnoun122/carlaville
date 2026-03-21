import { Test, TestingModule } from '@nestjs/testing';
import { PricingController } from './pricing.controller';
import { PricingService } from './pricing.service';

describe('PricingController', () => {
  let controller: PricingController;
  let service: jest.Mocked<Partial<PricingService>>;

  beforeEach(async () => {
    const mockPricingService = {
      calculatePrice: jest.fn().mockResolvedValue({ totalAmount: 100 }),
      createConfig: jest.fn().mockResolvedValue({ id: '1', active: true }),
      findAllConfigs: jest.fn().mockResolvedValue([]),
      getActiveConfig: jest.fn().mockResolvedValue({ id: '1' }),
      findConfigById: jest.fn().mockResolvedValue({ id: '1' }),
      updateConfig: jest.fn().mockResolvedValue({ id: '1', active: false }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PricingController],
      providers: [
        {
          provide: PricingService,
          useValue: mockPricingService,
        },
      ],
    }).compile();

    controller = module.get<PricingController>(PricingController);
    service = module.get(PricingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call calculatePrice', async () => {
    expect(await controller.calculatePrice({} as any)).toEqual({ totalAmount: 100 });
    expect(service.calculatePrice).toHaveBeenCalledWith({});
  });

  it('should call createConfig', async () => {
    expect(await controller.createConfig({} as any)).toEqual({ id: '1', active: true });
    expect(service.createConfig).toHaveBeenCalledWith({});
  });
});
