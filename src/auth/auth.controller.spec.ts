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

describe('AuthController', () => {
  let controller: AuthController;
  let _authService: jest.Mocked<AuthService>;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get(AuthController);
    _authService = module.get(AuthService);
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

      const login = mockAuthService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);

      expect(login).toHaveBeenCalledWith(loginDto);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('expiresIn');
    });

    it('should propagate 401 when credentials are invalid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'WrongPassword123',
      };

      const login = mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid email or password')
      );

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(login).toHaveBeenCalledWith(loginDto);
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

      const register = mockAuthService.register.mockResolvedValue(expectedResponse);

      const result = await controller.register(registerDto);

      expect(register).toHaveBeenCalledWith(registerDto);
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

      const register = mockAuthService.register.mockRejectedValue(conflictError);

      await expect(controller.register(registerDto)).rejects.toThrow(
        'User with this email already exists'
      );
      expect(register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('DTO Validation', () => {
    let app: INestApplication;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        controllers: [AuthController],
        providers: [
          {
            provide: AuthService,
            useValue: mockAuthService,
          },
        ],
      }).compile();

      app = moduleRef.createNestApplication();
      const validationPipe = new ValidationPipe({
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

      it('should reject long name', async () => {
        const registerDto = {
          email: 'test@example.com',
          password: 'ValidPass123',
          confirmPassword: 'ValidPass123',
          name: 'A'.repeat(101),
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
