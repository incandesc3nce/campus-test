import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from '../dto/login.dto';
import {
  loginBadRequestExamples,
  registerBadRequestExamples,
} from '../utils/badRequestExamples';
import { ApiBadRequestResponse } from '@/shared/decorators/swagger/apiBadRequestResponse.decorator';
import { RegisterDto } from '../dto/register.dto';

export function ApiDocumentAuthLogin() {
  return applyDecorators(
    ApiBody({
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
    }),
    ApiResponse({
      status: 200,
      description: 'Успешный вход в аккаунт',
      example: {
        accessToken: 'jwt-token-example',
        expiresIn: '3d',
      },
    }),
    ApiBadRequestResponse({ examples: loginBadRequestExamples }),
    ApiResponse({
      status: 401,
      description:
        'Пользователя не существует или предоставлен неверный email или пароль',
      example: {
        message: 'Invalid email or password',
        error: 'Unauthorized',
        statusCode: 401,
      },
    })
  );
}

export function ApiDocumentAuthRegister() {
  return applyDecorators(
    ApiBody({
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
    }),
    ApiResponse({
      status: 201,
      description: 'Пользователь успешно зарегистрирован',
      example: {
        accessToken: 'jwt-token-example',
        expiresIn: '3d',
      },
    }),
    ApiBadRequestResponse({ examples: registerBadRequestExamples }),
    ApiResponse({
      status: 409,
      description: 'Пользователь с таким email уже существует',
      example: {
        message: 'User with this email already exists',
        error: 'Conflict',
        statusCode: 409,
      },
    })
  );
}
