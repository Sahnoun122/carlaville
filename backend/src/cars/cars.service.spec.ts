import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { CarsService } from './cars.service';
import { Car } from './schemas/car.schema';

class MockCarModel {
  constructor(private data: any) {}
  save() { return Promise.resolve(this.data); }
  static find = jest.fn().mockReturnThis();
  static populate = jest.fn().mockReturnThis();
  static select = jest.fn().mockReturnThis();
  static skip = jest.fn().mockReturnThis();
  static limit = jest.fn().mockReturnThis();
  static sort = jest.fn().mockReturnThis();
  static exec = jest.fn().mockResolvedValue([]);
  static countDocuments = jest.fn().mockResolvedValue(0);
  static findById = jest.fn().mockReturnThis();
  static findByIdAndUpdate = jest.fn().mockReturnThis();
}

describe('CarsService', () => {
  let service: CarsService;
  let model: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarsService,
        {
          provide: getModelToken(Car.name),
          useValue: MockCarModel,
        },
      ],
    }).compile();

    service = module.get<CarsService>(CarsService);
    model = module.get(getModelToken(Car.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return cars and count', async () => {
      const result = await service.findAll({} as any, 1, 10);
      expect(result).toEqual({ cars: [], count: 0 });
      expect(model.find).toHaveBeenCalled();
    });
  });
});
