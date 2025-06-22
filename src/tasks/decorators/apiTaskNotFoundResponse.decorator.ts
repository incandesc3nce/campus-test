import { ApiNotFoundResponse } from '@/shared/decorators/swagger/apiNotFoundResponse.decorator';
import { applyDecorators } from '@nestjs/common';

export function ApiTaskNotFoundResponse() {
  return applyDecorators(
    ApiNotFoundResponse({
      description: 'Задача не найдена для данного пользователя',
      message: 'Task not found',
    })
  );
}
