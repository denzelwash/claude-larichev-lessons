import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { PublicUser } from '@app/shared';

jest.mock('@node-rs/bcrypt', () => ({ hash: jest.fn().mockResolvedValue('hashed') }));

const mockUser: PublicUser = { id: '1', email: 'user@test.com', name: 'User' };

describe('AuthService', () => {
  let service: AuthService;
  let commandBus: jest.Mocked<CommandBus>;
  let queryBus: jest.Mocked<QueryBus>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: CommandBus, useValue: { execute: jest.fn() } },
        { provide: QueryBus, useValue: { execute: jest.fn() } },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('token') } },
      ],
    }).compile();

    service = module.get(AuthService);
    commandBus = module.get(CommandBus);
    queryBus = module.get(QueryBus);
    jwtService = module.get(JwtService);
  });

  describe('register', () => {
    it('возвращает accessToken при успешной регистрации', async () => {
      commandBus.execute.mockResolvedValue(mockUser);
      const result = await service.register({ name: 'User', email: 'user@test.com', password: '123' });
      expect(result).toEqual({ accessToken: 'token' });
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: mockUser.id, email: mockUser.email });
    });

    it('пробрасывает ошибку, если commandBus отклоняется', async () => {
      commandBus.execute.mockRejectedValue(new Error('DB error'));
      await expect(service.register({ name: 'User', email: 'user@test.com', password: '123' }))
        .rejects.toThrow('DB error');
    });
  });

  describe('login', () => {
    it('возвращает accessToken при корректных credentials', async () => {
      queryBus.execute.mockResolvedValue(mockUser);
      const result = await service.login({ email: 'user@test.com', password: '123' });
      expect(result).toEqual({ accessToken: 'token' });
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: mockUser.id, email: mockUser.email });
    });

    it('бросает UnauthorizedException, если пользователь не найден', async () => {
      queryBus.execute.mockResolvedValue(null);
      await expect(service.login({ email: 'bad@test.com', password: 'wrong' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('пробрасывает ошибку, если queryBus отклоняется', async () => {
      queryBus.execute.mockRejectedValue(new Error('Query failed'));
      await expect(service.login({ email: 'user@test.com', password: '123' }))
        .rejects.toThrow('Query failed');
    });
  });
});
