import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/createTask.dto';
import { UpdateTaskDto } from './dto/updateTask.dto';
import { AuthGuard } from '@/auth/auth.guard';
import { CurrentUser } from '@/shared/decorators/currentUser.decorator';
import { JwtPayload } from '@/shared/types/JwtPayload';
import { TaskQueryDto } from './dto/taskQuery.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  ApiDocumentTasksCreate,
  ApiDocumentTasksDelete,
  ApiDocumentTasksFindAll,
  ApiDocumentTasksFindOne,
  ApiDocumentTasksUpdate,
} from './decorators/apiDocumentTasks.decorator';

@ApiTags('Задачи')
@ApiBearerAuth()
@Controller('tasks')
@UseGuards(AuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * Получение списка задач
   *
   * @remarks Возвращает список задач с возможностью фильтрации по статусу задачи и пагинации.
   */
  @Get()
  @ApiDocumentTasksFindAll()
  findAll(@Query() query: TaskQueryDto, @CurrentUser() user: JwtPayload) {
    return this.tasksService.findAll(query, user.sub);
  }

  /**
   * Создание новой задачи
   *
   * @remarks Создает новую задачу для текущего пользователя.
   * Принимает заголовок, описание и статус задачи.
   */
  @Post()
  @HttpCode(201)
  @ApiDocumentTasksCreate()
  create(@Body() createTaskDto: CreateTaskDto, @CurrentUser() user: JwtPayload) {
    return this.tasksService.createTask(createTaskDto, user.sub);
  }

  /**
   * Получение задачи по ID
   *
   * @remarks Возвращает задачу с указанным ID или 404, если задача не найдена.
   */
  @Get(':id')
  @ApiDocumentTasksFindOne()
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.tasksService.findOne(id, user.sub);
  }

  /**
   * Обновление задачи
   *
   * @remarks Обновляет значения существующей задачи по ее ID и возвращает обновленную задачу.
   */
  @Patch(':id')
  @ApiDocumentTasksUpdate()
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: JwtPayload
  ) {
    return this.tasksService.updateTask(id, updateTaskDto, user.sub);
  }

  /**
   * Удаление задачи
   *
   * @remarks Удаляет задачу по ее ID. Возвращает 204 при успешном удалении.
   */
  @Delete(':id')
  @HttpCode(204)
  @ApiDocumentTasksDelete()
  delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.tasksService.deleteTask(id, user.sub);
  }
}
