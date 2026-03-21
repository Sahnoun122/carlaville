import { Test, TestingModule } from '@nestjs/testing';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';

describe('BlogsController', () => {
  let controller: BlogsController;
  let service: jest.Mocked<Partial<BlogsService>>;

  beforeEach(async () => {
    const mockBlogsService = {
      create: jest.fn().mockResolvedValue({ id: '1', title: 'Test Blog' }),
      findAll: jest.fn().mockResolvedValue({ blogs: [], count: 0 }),
      findById: jest.fn().mockResolvedValue({ id: '1', title: 'Test Blog' }),
      update: jest.fn().mockResolvedValue({ id: '1', title: 'Updated Blog' }),
      remove: jest.fn().mockResolvedValue({ message: 'Blog deleted successfully' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogsController],
      providers: [
        {
          provide: BlogsService,
          useValue: mockBlogsService,
        },
      ],
    }).compile();

    controller = module.get<BlogsController>(BlogsController);
    service = module.get(BlogsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create', async () => {
    expect(await controller.create({} as any)).toEqual({ id: '1', title: 'Test Blog' });
    expect(service.create).toHaveBeenCalled();
  });

  it('should call findAll', async () => {
    expect(await controller.findAll({} as any, 1, 10)).toEqual({ blogs: [], count: 0 });
    expect(service.findAll).toHaveBeenCalledWith({}, 1, 10);
  });

  it('should call findOne', async () => {
    expect(await controller.findOne('1')).toEqual({ id: '1', title: 'Test Blog' });
    expect(service.findById).toHaveBeenCalledWith('1');
  });

  it('should call update', async () => {
    expect(await controller.update('1', {} as any)).toEqual({ id: '1', title: 'Updated Blog' });
    expect(service.update).toHaveBeenCalledWith('1', {});
  });

  it('should call remove', async () => {
    expect(await controller.remove('1')).toEqual({ message: 'Blog deleted successfully' });
    expect(service.remove).toHaveBeenCalledWith('1');
  });
});
