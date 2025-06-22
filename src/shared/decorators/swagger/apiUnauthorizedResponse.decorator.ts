import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

/**
 * Декоратор для документации ответа API при неавторизованном доступе.
 */
export function ApiUnauthorizedResponse() {
  return applyDecorators(
    ApiResponse({
      status: 401,
      description: 'Пользователь не авторизован',
      examples: {
        noToken: {
          summary: 'Токен не предоставлен',
          value: {
            message: 'You must be logged in to access this resource',
            error: 'Unauthorized',
            statusCode: 401,
          },
        },
        invalidToken: {
          summary: 'Неверный токен',
          value: {
            message: 'Invalid token',
            error: 'Unauthorized',
            statusCode: 401,
          },
        },
      },
    })
  );
}
