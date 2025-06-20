import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { JwtPayload } from '@/shared/types/JwtPayload';
import { Request } from 'express';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  const createMockExecutionContext = (headers: { authorization: string }) => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers,
        }),
      }),
    } as unknown as ExecutionContext;
    return mockContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthGuard, JwtService],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);

    process.env.JWT_SECRET = 'test-secret';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    const verifyAsyncSpy = jest.spyOn(JwtService.prototype, 'verifyAsync');

    it('should return true for valid token', async () => {
      const mockToken = 'valid-token';
      const mockPayload = { sub: 'user-123', email: 'test@example.com' };
      const mockContext = createMockExecutionContext({
        authorization: `Bearer ${mockToken}`,
      });

      verifyAsyncSpy.mockResolvedValue(mockPayload);

      const result = await guard.canActivate(mockContext);

      expect(verifyAsyncSpy).toHaveBeenCalledWith(mockToken, {
        secret: 'test-secret',
      });
      const request: Request & { user?: JwtPayload } = mockContext
        .switchToHttp()
        .getRequest();
      expect(request.user).toEqual(mockPayload);
      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException when no token is provided', async () => {
      const mockContext = createMockExecutionContext({ authorization: '' });

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        new UnauthorizedException('You must be logged in to access this resource')
      );
      expect(verifyAsyncSpy).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      const mockToken = 'invalid-token';
      const mockContext = createMockExecutionContext({
        authorization: `Bearer ${mockToken}`,
      });

      verifyAsyncSpy.mockRejectedValue(new UnauthorizedException('Invalid token'));

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        new UnauthorizedException('Invalid token')
      );
      expect(verifyAsyncSpy).toHaveBeenCalledWith(mockToken, {
        secret: 'test-secret',
      });
    });

    it('should throw UnauthorizedException when authorization header has wrong format', async () => {
      const mockContext = createMockExecutionContext({
        authorization: 'InvalidFormat token123',
      });

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        new UnauthorizedException('You must be logged in to access this resource')
      );
      expect(verifyAsyncSpy).not.toHaveBeenCalled();
    });
  });
});
