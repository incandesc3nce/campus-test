import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import { HashingService } from '@/shared/hashing/hashing.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from '@/shared/prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let hashingService: HashingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, UsersService, JwtService, HashingService, PrismaService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    hashingService = module.get<HashingService>(HashingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return access token when credentials are valid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
      };

      const expectedToken = 'jwt-token';

      const findOneByEmailSpy = jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValue(mockUser);
      const verifyPasswordSpy = jest
        .spyOn(hashingService, 'verifyPassword')
        .mockResolvedValue(true);
      const signAsyncSpy = jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValue(expectedToken);

      const result = await service.login(loginDto);

      expect(findOneByEmailSpy).toHaveBeenCalledWith(loginDto.email);
      expect(verifyPasswordSpy).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.passwordHash
      );
      expect(signAsyncSpy).toHaveBeenCalledWith(
        { sub: mockUser.id, email: mockUser.email },
        { expiresIn: '3d' }
      );
      expect(result).toEqual({
        accessToken: expectedToken,
        expiresIn: '3d',
      });
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'WrongPassword123',
      };

      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
      };

      const findOneByEmailSpy = jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValue(mockUser);
      const verifyPasswordSpy = jest
        .spyOn(hashingService, 'verifyPassword')
        .mockResolvedValue(false);
      const signAsyncSpy = jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValue('jwt-token');

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid email or password')
      );

      expect(findOneByEmailSpy).toHaveBeenCalledWith(loginDto.email);
      expect(verifyPasswordSpy).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.passwordHash
      );
      expect(signAsyncSpy).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should create a user and return access token', async () => {
      const registerDto: RegisterDto = {
        email: 'newuser@example.com',
        password: 'Password123',
        name: 'New User',
        confirmPassword: 'Password123',
      };

      const mockCreatedUser = {
        id: 'new-user-123',
        email: 'newuser@example.com',
        name: 'New User',
        passwordHash: 'hashed-password',
      };

      const expectedToken = 'jwt-token';

      const createUserSpy = jest
        .spyOn(usersService, 'createUser')
        .mockResolvedValue(mockCreatedUser);
      const signAsyncSpy = jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValue(expectedToken);

      const result = await service.register(registerDto);

      expect(createUserSpy).toHaveBeenCalledWith({
        email: registerDto.email,
        name: registerDto.name,
        password: registerDto.password,
      });
      expect(signAsyncSpy).toHaveBeenCalledWith(
        { sub: mockCreatedUser.id, email: mockCreatedUser.email },
        { expiresIn: '3d' }
      );
      expect(result).toEqual({
        accessToken: expectedToken,
        expiresIn: '3d',
      });
    });
  });
});
