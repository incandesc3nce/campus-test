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
import { TaskQueryDto } from './dto/queryTask.dto';

@Controller('tasks')
@UseGuards(AuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @CurrentUser() user: JwtPayload) {
    return this.tasksService.createTask(createTaskDto, user.sub);
  }

  @Get()
  findAll(@Query() query: TaskQueryDto, @CurrentUser() user: JwtPayload) {
    return this.tasksService.findAll(query, user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.tasksService.findOne(id, user.sub);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: JwtPayload
  ) {
    return this.tasksService.updateTask(id, updateTaskDto, user.sub);
  }

  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.tasksService.deleteTask(id, user.sub);
  }
}
