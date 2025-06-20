import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/createTask.dto';
import { UpdateTaskDto } from './dto/updateTask.dto';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { TaskResponseDto } from './dto/taskResponse.dto';

@Injectable()
export class TasksService {
  constructor(private prismaService: PrismaService) {}

  async createTask(
    createTaskDto: CreateTaskDto,
    userId: string
  ): Promise<TaskResponseDto> {
    const { title, description, status } = createTaskDto;

    const newTask = await this.prismaService.task.create({
      data: {
        title,
        description,
        status,
        userId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return newTask;
  }

  async findAll(userId: string): Promise<TaskResponseDto[]> {
    const tasks = await this.prismaService.task.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return tasks;
  }

  async findOne(id: string, userId: string): Promise<TaskResponseDto> {
    const task = await this.prismaService.task.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!task || task.userId !== userId) {
      throw new NotFoundException('Task not found');
    }

    const taskWithoutUserId: TaskResponseDto = {
      ...task,
      userId: undefined,
    };

    return taskWithoutUserId;
  }

  async updateTask(
    id: string,
    updateTaskDto: UpdateTaskDto,
    userId: string
  ): Promise<TaskResponseDto> {
    const existingTask = await this.prismaService.task.findUnique({
      where: { id },
      select: {
        userId: true,
      },
    });

    if (!existingTask || existingTask.userId !== userId) {
      throw new NotFoundException('Task not found');
    }

    const { title, description, status } = updateTaskDto;

    return this.prismaService.task.update({
      where: { id },
      data: {
        title,
        description,
        status,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteTask(id: string, userId: string): Promise<void> {
    const existingTask = await this.prismaService.task.findUnique({
      where: { id },
      select: {
        userId: true,
      },
    });

    if (!existingTask || existingTask.userId !== userId) {
      throw new NotFoundException('Task not found');
    }

    await this.prismaService.task.delete({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
