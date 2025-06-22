import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { TaskStatus } from 'generated/prisma';
import { ApiTaskStatusProperty } from '../decorators/apiTaskStatusProperty.decorator';

export class CreateTaskDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;
  @IsEnum(TaskStatus, {
    message: 'Status must be a valid TaskStatus (TODO, IN_PROGRESS, DONE)',
  })
  @IsOptional()
  @ApiTaskStatusProperty()
  status?: TaskStatus;
}
