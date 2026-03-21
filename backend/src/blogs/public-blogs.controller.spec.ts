import { Test, TestingModule } from '@nestjs/testing';
import { PublicBlogsController } from './public-blogs.controller';
import { BlogsService } from './blogs.service';

describe('PublicBlogsController', () => {
  let controller: PublicBlogsController;
  let service: jest.Mocked<Partial<BlogsService>>;

  beforeEach(async () => {
    const mockBlogsService = {
      findPublished: jest.fn().mockResolvedValue({ blogs: [], count: 0 }),
      findPublishedBySlug: jest.fn().mockResolvedValue({ id: '1', title: 'Test Blog', slug: 'test-blog' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicBlogsController],
      providers: [
        {
          provide: BlogsService,
          useValue: mockBlogsService,
        },
      ],
    }).compile();

    controller = module.get<PublicBlogsController>(PublicBlogsController);
    service = module.get(BlogsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call findAll', async () => {
    expect(await controller.findAll(1, 10)).toEqual({ blogs: [], count: 0 });
    expect(service.findPublished).toHaveBeenCalledWith(1, 10);
  });

  it('should call findOne', async () => {
    expect(await controller.findOne('test-blog')).toEqual({ id: '1', title: 'Test Blog', slug: 'test-blog' });
    expect(service.findPublishedBySlug).toHaveBeenCalledWith('test-blog');
  });
});
