import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './createTask.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TaskStatus } from 'generated/prisma';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsString({ message: 'Title must be a string' })
  @IsOptional()
  title?: string;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus, {
    message: 'Status must be a valid TaskStatus (TODO, IN_PROGRESS, DONE)',
  })
  @IsOptional()
  status?: TaskStatus;
}
