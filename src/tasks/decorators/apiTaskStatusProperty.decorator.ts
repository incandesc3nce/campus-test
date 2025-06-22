import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from 'generated/prisma';

export function ApiTaskStatusProperty() {
  return applyDecorators(
    ApiProperty({
      enum: TaskStatus,
      enumName: 'TaskStatus',
      example: TaskStatus.TODO,
      required: false,
    })
  );
}
