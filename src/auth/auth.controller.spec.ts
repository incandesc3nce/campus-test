import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  ConflictException,
  UnauthorizedException,
  ValidationPipe,
  INestApplication,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { UsersService } from '@/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { HashingService } from '@/shared/hashing/hashing.service';
import { PrismaService } from '@/shared/prisma/prisma.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, UsersService, JwtService, HashingService, PrismaService],
    }).compile();

    controller = module.get(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return access token when credentials are valid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const expectedResponse = {
        accessToken: 'test-token',
        expiresIn: '3d',
      };

      const loginSpy = jest
        .spyOn(authService, 'login')
        .mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);
      expect(loginSpy).toHaveBeenCalledWith(loginDto);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('expiresIn');
    });

    it('should propagate 401 when credentials are invalid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'WrongPassword123',
      };

      const loginSpy = jest
        .spyOn(authService, 'login')
        .mockRejectedValue(new UnauthorizedException('Invalid email or password'));

      expect(loginSpy).not.toHaveBeenCalledWith(loginDto);
      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should return access token when input is valid', async () => {
      const registerDto: RegisterDto = {
        email: 'newuser@example.com',
        password: 'Password123',
        name: 'New User',
        confirmPassword: 'Password123',
      };

      const expectedResponse = {
        accessToken: 'test-token',
        expiresIn: '3d',
      };

      const registerSpy = jest
        .spyOn(authService, 'register')
        .mockResolvedValue(expectedResponse);

      const result = await controller.register(registerDto);

      expect(registerSpy).toHaveBeenCalledWith(registerDto);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('expiresIn');
    });

    it('should propagate errors when registration fails', async () => {
      const registerDto: RegisterDto = {
        email: 'existing@example.com',
        password: 'Password123',
        name: 'Existing User',
        confirmPassword: 'Password123',
      };

      const conflictError = new ConflictException('User with this email already exists');

      const registerSpy = jest
        .spyOn(authService, 'register')
        .mockRejectedValue(conflictError);

      registerSpy.mockRejectedValue(conflictError);

      expect(registerSpy).not.toHaveBeenCalledWith(registerDto);
      await expect(controller.register(registerDto)).rejects.toThrow(
        'User with this email already exists'
      );
    });
  });

  describe('DTO Validation', () => {
    let app: INestApplication;
    let validationPipe;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        controllers: [AuthController],
        providers: [
          {
            provide: AuthService,
            useValue: {
              login: jest.fn(),
              register: jest.fn(),
            },
          },
        ],
      }).compile();

      app = moduleRef.createNestApplication();
      validationPipe = new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      });
      app.useGlobalPipes(validationPipe);
      await app.init();
    });

    afterEach(async () => {
      if (app) {
        await app.close();
      }
    });

    describe('LoginDto', () => {
      it('should reject empty email', async () => {
        const loginDto = {
          email: '',
          password: 'ValidPass123',
        };

        const errors = await validate(Object.assign(new LoginDto(), loginDto));
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isNotEmpty');
      });

      it('should reject invalid email format', async () => {
        const loginDto = {
          email: 'not-an-email',
          password: 'ValidPass123',
        };

        const errors = await validate(Object.assign(new LoginDto(), loginDto));
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isEmail');
      });

      it('should reject password without numbers', async () => {
        const loginDto = {
          email: 'test@example.com',
          password: 'PasswordNoNumbers',
        };

        const errors = await validate(Object.assign(new LoginDto(), loginDto));
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('matches');
      });

      it('should reject password without uppercase letters', async () => {
        const loginDto = {
          email: 'test@example.com',
          password: 'password123',
        };

        const errors = await validate(Object.assign(new LoginDto(), loginDto));
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('matches');
      });

      it('should reject password without lowercase letters', async () => {
        const loginDto = {
          email: 'test@example.com',
          password: 'PASSWORD123',
        };

        const errors = await validate(Object.assign(new LoginDto(), loginDto));
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('matches');
      });

      it('should reject password below 8 characters', async () => {
        const loginDto = {
          email: 'test@example.com',
          password: 'Pass1',
        };

        const errors = await validate(Object.assign(new LoginDto(), loginDto));
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('minLength');
      });

      it('should accept valid login data', async () => {
        const loginDto = {
          email: 'test@example.com',
          password: 'ValidPass123',
        };

        const errors = await validate(Object.assign(new LoginDto(), loginDto));
        expect(errors.length).toBe(0);
      });
    });

    describe('RegisterDto', () => {
      it("should reject when passwords don't match", async () => {
        const registerDto = {
          email: 'test@example.com',
          password: 'ValidPass123',
          confirmPassword: 'DifferentPass123',
          name: 'Test User',
        };

        const errors = await validate(Object.assign(new RegisterDto(), registerDto));
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('match');
      });

      it('should reject empty name', async () => {
        const registerDto = {
          email: 'test@example.com',
          password: 'ValidPass123',
          confirmPassword: 'ValidPass123',
          name: '',
        };

        const errors = await validate(Object.assign(new RegisterDto(), registerDto));
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isNotEmpty');
      });

      it('should reject too long name', async () => {
        const registerDto = {
          email: 'test@example.com',
          password: 'ValidPass123',
          confirmPassword: 'ValidPass123',
          name: 'A'.repeat(101), // 101 characters
        };

        const errors = await validate(Object.assign(new RegisterDto(), registerDto));
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('maxLength');
      });

      it('should accept valid registration data', async () => {
        const registerDto = {
          email: 'test@example.com',
          password: 'ValidPass123',
          confirmPassword: 'ValidPass123',
          name: 'Test User',
        };

        const errors = await validate(Object.assign(new RegisterDto(), registerDto));
        expect(errors.length).toBe(0);
      });
    });
  });
});
