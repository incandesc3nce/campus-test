import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

/**
 * Декоратор для документации ответа API при отсутствии ресурса.
 */
export function ApiNotFoundResponse({
  description = 'Resource not found',
  message = 'The requested resource could not be found',
}: {
  description?: string;
  message?: string;
}) {
  return applyDecorators(
    ApiResponse({
      status: 404,
      description,
      example: {
        message,
        error: 'Not Found',
        statusCode: 404,
      },
    })
  );
}
