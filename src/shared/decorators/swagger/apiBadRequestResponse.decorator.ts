import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import type { ApiResponseExamples } from '@nestjs/swagger';

export function ApiBadRequestResponse({
  description = 'Некорректные данные',
  examples,
}: {
  description?: string;
  examples?: Record<string, ApiResponseExamples>;
}) {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: description,
      examples: examples,
    })
  );
}
