import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<Partial<UsersService>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;

  beforeEach(async () => {
    const mockUsersService = {
      findOneByEmailWithPassword: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    const mockJwtService = {
      signAsync: jest.fn().mockResolvedValue('test_token'),
    };

    const mockConfigService = {
      get: jest.fn().mockReturnValue('1d'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      (usersService.findOneByEmailWithPassword as jest.Mock).mockResolvedValueOnce(null);
      await expect(service.login({ email: 'test@example.com', password: 'pw' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should return token if credentials are valid', async () => {
      (usersService.findOneByEmailWithPassword as jest.Mock).mockResolvedValueOnce({
        id: '1', email: 'test', password: 'hashed', name: 'John Doe', role: 'CLIENT'
      } as any);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const result = await service.login({ email: 'test', password: 'pw' });
      expect(result.accessToken).toBe('test_token');
    });
  });
});
