import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Throttle } from '@nestjs/throttler';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Аутентификация')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Вход в аккаунт существующего пользователя
   *
   * @remarks Проверяет email и пароль пользователя, возвращает JWT и время истечения при успешной аутентификации.
   */
  @ApiBody({
    type: LoginDto,
    description: 'Email и пароль для входа в аккаунт',
    required: true,
    examples: {
      success: {
        summary: 'Корректные данные',
        value: {
          email: 'user@email.com',
          password: 'Password123',
        },
      },
      invalid: {
        summary: 'Некорректные данные',
        value: {
          email: 'email',
          password: 'pass',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Успешный вход в аккаунт',
    example: {
      accessToken: 'jwt-token-example',
      expiresIn: '3d',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные для входа',
    examples: {
      invalidEmail: {
        summary: 'Некорректный email',
        value: {
          message: ['Please provide a valid email address'],
          error: 'Bad Request',
          statusCode: 400,
        },
      },
      noEmail: {
        summary: 'Email не указан',
        value: {
          message: ['Email is required', 'Please provide a valid email address'],
          error: 'Bad Request',
          statusCode: 400,
        },
      },
      invalidPassword: {
        summary: 'Несоотвествие пароля требованиям',
        value: {
          message: [
            'Password must contain at least one uppercase letter, one lowercase letter, and one number',
          ],
          error: 'Bad Request',
          statusCode: 400,
        },
      },
      tooShortPassword: {
        summary: 'Пароль слишком короткий',
        value: {
          message: ['Password must be at least 8 characters long'],
          error: 'Bad Request',
          statusCode: 400,
        },
      },
      tooLongPassword: {
        summary: 'Пароль слишком длинный',
        value: {
          message: ['Password must not exceed 100 characters'],
          error: 'Bad Request',
          statusCode: 400,
        },
      },
      noPassword: {
        summary: 'Пароль не указан',
        value: {
          message: [
            'Password is required',
            'Password must be at least 8 characters long',
            'Password must contain at least one uppercase letter, one lowercase letter, and one number',
          ],
          error: 'Bad Request',
          statusCode: 400,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Пользователя не существует или предоставлен неверный email или пароль',
    example: {
      message: 'Invalid email or password',
      error: 'Unauthorized',
      statusCode: 401,
    },
  })
  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Регистрация нового пользователя
   *
   * @remarks Создает нового пользователя с указанным email, именем и паролем, возвращает JWT и время истечения при успешной регистрации.
   *
   */
  @ApiBody({
    type: RegisterDto,
    description:
      'Email, имя, пароль для регистрации нового пользователя и подтверждение пароля',
    required: true,
    examples: {
      success: {
        summary: 'Корректные данные',
        value: {
          email: 'user@email.com',
          name: 'User Name',
          password: 'Password123',
          confirmPassword: 'Password123',
        },
      },
      invalid: {
        summary: 'Некорректные данные',
        value: {
          email: 'email',
          name: '',
          password: 'pass',
          confirmPassword: 'passwor',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно зарегистрирован',
    example: {
      accessToken: 'jwt-token-example',
      expiresIn: '3d',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные для регистрации',
    examples: {
      invalidEmail: {
        summary: 'Некорректный email',
        value: {
          message: ['Please provide a valid email address'],
          error: 'Bad Request',
          statusCode: 400,
        },
      },

      noEmail: {
        summary: 'Email не указан',
        value: {
          message: ['Email is required', 'Please provide a valid email address'],
          error: 'Bad Request',
          statusCode: 400,
        },
      },

      noName: {
        summary: 'Имя не указано',
        value: {
          message: ['Name is required', 'Name must be at least 1 character long'],
          error: 'Bad Request',
          statusCode: 400,
        },
      },

      nameIsNotString: {
        summary: 'Имя должно быть строкой',
        value: {
          message: ['Name must be a string'],
          error: 'Bad Request',
          statusCode: 400,
        },
      },

      nameTooShort: {
        summary: 'Имя слишком короткое',
        value: {
          message: ['Name must be at least 1 character long'],
          error: 'Bad Request',
          statusCode: 400,
        },
      },

      nameTooLong: {
        summary: 'Имя слишком длинное',
        value: {
          message: ['Name must not exceed 100 characters'],
          error: 'Bad Request',
          statusCode: 400,
        },
      },

      invalidPassword: {
        summary: 'Несоотвествие пароля требованиям',
        value: {
          message: [
            'Password must contain at least one uppercase letter, one lowercase letter, and one number',
          ],
          error: 'Bad Request',
          statusCode: 400,
        },
      },

      tooShortPassword: {
        summary: 'Пароль слишком короткий',
        value: {
          message: ['Password must be at least 8 characters long'],
          error: 'Bad Request',
          statusCode: 400,
        },
      },

      tooLongPassword: {
        summary: 'Пароль слишком длинный',
        value: {
          message: ['Password must not exceed 100 characters'],
          error: 'Bad Request',
          statusCode: 400,
        },
      },

      noPassword: {
        summary: 'Пароль не указан',
        value: {
          message: [
            'Password is required',
            'Password must be at least 8 characters long',
            'Password must contain at least one uppercase letter, one lowercase letter, and one number',
          ],
          error: 'Bad Request',
          statusCode: 400,
        },
      },

      noConfirmPassword: {
        summary: 'Пароль не подтвержден',
        value: {
          message: ['Confirm password is required', 'Passwords do not match'],
          error: 'Bad Request',
          statusCode: 400,
        },
      },

      passwordsDoNotMatch: {
        summary: 'Пароли не совпадают',
        value: {
          message: ['Passwords do not match'],
          error: 'Bad Request',
          statusCode: 400,
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Пользователь с таким email уже существует',
    example: {
      message: 'User with this email already exists',
      error: 'Conflict',
      statusCode: 409,
    },
  })
  @Post('register')
  @HttpCode(201)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}
