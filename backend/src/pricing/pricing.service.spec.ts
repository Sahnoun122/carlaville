import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { PricingService } from './pricing.service';
import { PricingConfig } from './schemas/pricing-config.schema';

class MockPricingConfigModel {
  constructor(private data: any) {}
  save() { return Promise.resolve(this.data); }
  static find = jest.fn().mockReturnThis();
  static findById = jest.fn().mockReturnThis();
  static findByIdAndUpdate = jest.fn().mockReturnThis();
  static findOne = jest.fn().mockReturnThis();
  static exec = jest.fn().mockResolvedValue([]);
}

describe('PricingService', () => {
  let service: PricingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingService,
        {
          provide: getModelToken(PricingConfig.name),
          useValue: MockPricingConfigModel,
        },
      ],
    }).compile();

    service = module.get<PricingService>(PricingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call findAllConfigs', async () => {
    const result = await service.findAllConfigs();
    expect(result).toBeDefined();
  });
});
