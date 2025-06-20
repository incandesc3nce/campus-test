import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import { HashingService } from '@/shared/hashing/hashing.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

describe('AuthService', () => {
  let service: AuthService;
  let _usersService: UsersService;
  let _jwtService: JwtService;
  let _hashingService: HashingService;

  const mockUsersService = {
    findOneByEmail: jest.fn(),
    createUser: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockHashingService = {
    verifyPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: HashingService,
          useValue: mockHashingService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    _usersService = module.get<UsersService>(UsersService);
    _jwtService = module.get<JwtService>(JwtService);
    _hashingService = module.get<HashingService>(HashingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const findOne = mockUsersService.findOneByEmail;
    const verifyPassword = mockHashingService.verifyPassword;
    const signAsync = mockJwtService.signAsync;

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

      findOne.mockResolvedValue(mockUser);
      verifyPassword.mockResolvedValue(true);
      signAsync.mockResolvedValue(expectedToken);

      const result = await service.login(loginDto);

      expect(findOne).toHaveBeenCalledWith(loginDto.email);
      expect(verifyPassword).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.passwordHash
      );
      expect(signAsync).toHaveBeenCalledWith(
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

      findOne.mockResolvedValue(mockUser);
      verifyPassword.mockResolvedValue(false);
      signAsync.mockResolvedValue('jwt-token');

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid email or password')
      );

      expect(findOne).toHaveBeenCalledWith(loginDto.email);
      expect(verifyPassword).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.passwordHash
      );
      expect(signAsync).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    const createUser = mockUsersService.createUser;
    const signAsync = mockJwtService.signAsync;
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

      createUser.mockResolvedValue(mockCreatedUser);
      signAsync.mockResolvedValue(expectedToken);

      const result = await service.register(registerDto);

      expect(createUser).toHaveBeenCalledWith({
        email: registerDto.email,
        name: registerDto.name,
        password: registerDto.password,
      });
      expect(signAsync).toHaveBeenCalledWith(
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
