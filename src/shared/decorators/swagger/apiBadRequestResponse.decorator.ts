import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import type { ApiResponseExamples } from '@nestjs/swagger';

export function ApiBadRequestResponse(examples?: Record<string, ApiResponseExamples>) {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: 'Некорректные данные',
      examples: examples,
    })
  );
}
