import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { BlogsService } from './blogs.service';
import { Blog } from './schemas/blog.schema';

class MockBlogModel {
  static create = jest.fn().mockResolvedValue({ _id: '1', title: 'Test Blog' });
  static findOne = jest.fn().mockReturnThis();
  static find = jest.fn().mockReturnThis();
  static skip = jest.fn().mockReturnThis();
  static limit = jest.fn().mockReturnThis();
  static sort = jest.fn().mockReturnThis();
  static lean = jest.fn().mockReturnThis();
  static exec = jest.fn().mockResolvedValue([]);
  static countDocuments = jest.fn().mockResolvedValue(0);
  static findById = jest.fn().mockReturnThis();
  static findByIdAndUpdate = jest.fn().mockReturnThis();
  static findByIdAndDelete = jest.fn().mockReturnThis();
}

describe('BlogsService', () => {
  let service: BlogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogsService,
        {
          provide: getModelToken(Blog.name),
          useValue: MockBlogModel,
        },
      ],
    }).compile();

    service = module.get<BlogsService>(BlogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call findAll returning empty list', async () => {
    const result = await service.findAll({} as any, 1, 10);
    expect(result).toBeDefined();
  });
});
