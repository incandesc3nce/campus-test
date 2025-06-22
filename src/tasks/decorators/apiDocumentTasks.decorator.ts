import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { FilteredTasksResponseDto } from '../dto/filteredTaskResponse.dto';
import { ApiBadRequestResponse } from '@/shared/decorators/swagger/apiBadRequestResponse.decorator';
import {
  createBadRequestExamples,
  findAllBadRequestExamples,
} from '../utils/badRequestExamples';
import { CreateTaskDto } from '../dto/createTask.dto';
import { TaskResponseDto } from '../dto/taskResponse.dto';
import { ApiTaskNotFoundResponse } from './apiTaskNotFoundResponse.decorator';
import { ApiUnauthorizedResponse } from '@/shared/decorators/swagger/apiUnauthorizedResponse.decorator';

export function ApiDocumentTasksFindAll() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Список задач успешно получен',
      type: FilteredTasksResponseDto,
      examples: {
        withItems: {
          summary: 'Список задач с элементами',
          value: {
            data: [
              {
                id: '123e4567-e89b-12d3-a456-426614174000',
                title: 'Complete project documentation',
                description: 'Write comprehensive documentation for the API endpoints',
                status: 'TODO',
                createdAt: new Date('2025-06-21T10:00:00Z'),
                updatedAt: new Date('2025-06-21T10:30:00Z'),
              },
            ],
            total: 1,
            offset: 0,
            limit: 10,
          },
        },
        empty: {
          summary: 'Пустой список задач',
          value: {
            data: [],
            total: 0,
            offset: 0,
            limit: 10,
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Некорректные query параметры',
      examples: findAllBadRequestExamples,
    }),
    ApiUnauthorizedResponse()
  );
}

export function ApiDocumentTasksCreate() {
  return applyDecorators(
    ApiBody({
      type: CreateTaskDto,
    }),
    ApiResponse({
      status: 201,
      description: 'Задача успешно создана',
      type: TaskResponseDto,
    }),
    ApiBadRequestResponse({ examples: createBadRequestExamples }),
    ApiUnauthorizedResponse()
  );
}

export function ApiDocumentTasksFindOne() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Задача успешно найдена',
      type: TaskResponseDto,
    }),
    ApiUnauthorizedResponse(),
    ApiTaskNotFoundResponse()
  );
}

export function ApiDocumentTasksUpdate() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Задача успешно обновлена',
      type: TaskResponseDto,
    }),
    ApiBadRequestResponse({
      examples: createBadRequestExamples,
    }),
    ApiUnauthorizedResponse(),
    ApiTaskNotFoundResponse()
  );
}

export function ApiDocumentTasksDelete() {
  return applyDecorators(
    ApiResponse({
      status: 204,
      description: 'Задача успешно удалена',
    }),
    ApiUnauthorizedResponse(),
    ApiTaskNotFoundResponse()
  );
}
