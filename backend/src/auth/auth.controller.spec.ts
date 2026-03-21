import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<Partial<AuthService>>;

  beforeEach(async () => {
    const mockAuthService = {
      login: jest.fn().mockResolvedValue({ accessToken: 'token' }),
      register: jest.fn().mockResolvedValue({ accessToken: 'token' }),
      updateProfile: jest.fn().mockResolvedValue({ id: '1', firstName: 'Test' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call login', async () => {
    const dto = { email: 'test@example.com', password: 'password' };
    const result = await controller.login(dto);
    expect(authService.login).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ accessToken: 'token' });
  });

  it('should call register', async () => {
    const dto = { email: 'test@example.com', password: 'password', firstName: 'John', lastName: 'Doe', phone: '123' };
    const result = await controller.register(dto);
    expect(authService.register).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ accessToken: 'token' });
  });
});
