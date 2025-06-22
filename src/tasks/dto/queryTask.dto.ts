import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { TaskStatus } from 'generated/prisma';
import { ApiTaskStatusProperty } from '../decorators/apiTaskStatusProperty.decorator';

export class TaskQueryDto {
  @IsOptional()
  @IsEnum(TaskStatus, {
    message: 'Status must be a valid TaskStatus (TODO, IN_PROGRESS, DONE)',
  })
  @ApiTaskStatusProperty()
  status?: TaskStatus;

  @IsOptional()
  @IsInt({ message: 'Offset must be an integer' })
  @Min(1, { message: 'Offset must be at least 1' })
  @Type(() => Number)
  offset?: number = 1;

  @IsOptional()
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Type(() => Number)
  limit?: number = 10;
}
