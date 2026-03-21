import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { AgenciesService } from './agencies.service';
import { Agency } from './schemas/agency.schema';

class MockAgencyModel {
  constructor(private data: any) {}
  save() {
    return Promise.resolve(this.data);
  }
  static find = jest.fn().mockReturnThis();
  static skip = jest.fn().mockReturnThis();
  static limit = jest.fn().mockReturnThis();
  static sort = jest.fn().mockReturnThis();
  static exec = jest.fn().mockResolvedValue([]);
  static countDocuments = jest.fn().mockResolvedValue(0);
  static findById = jest.fn().mockReturnThis();
  static findByIdAndUpdate = jest.fn().mockReturnThis();
}

describe('AgenciesService', () => {
  let service: AgenciesService;
  let model: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgenciesService,
        {
          provide: getModelToken(Agency.name),
          useValue: MockAgencyModel,
        },
      ],
    }).compile();

    service = module.get<AgenciesService>(AgenciesService);
    model = module.get(getModelToken(Agency.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return agencies and count', async () => {
      const result = await service.findAll({} as any, 1, 10);
      expect(result).toEqual({ agencies: [], count: 0 });
      expect(model.find).toHaveBeenCalled();
    });
  });
});
