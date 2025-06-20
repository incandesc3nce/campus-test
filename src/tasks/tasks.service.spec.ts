import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { CreateTaskDto } from './dto/createTask.dto';
import { UpdateTaskDto } from './dto/updateTask.dto';
import { TaskQueryDto } from './dto/queryTask.dto';
import { TaskStatus } from 'generated/prisma';
import { NotFoundException } from '@nestjs/common';

describe('TasksService', () => {
  let service: TasksService;
  let _prismaService: PrismaService;

  const mockPrismaService = {
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockUserId = 'user-123';
  const mockTaskId = 'task-123';

  const mockTask = {
    id: mockTaskId,
    title: 'Test Task',
    description: 'Task Description',
    status: TaskStatus.TODO,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    _prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'New Description',
        status: TaskStatus.TODO,
      };

      mockPrismaService.task.create.mockResolvedValue(mockTask);

      const result = await service.createTask(createTaskDto, mockUserId);

      expect(mockPrismaService.task.create).toHaveBeenCalledWith({
        data: {
          title: createTaskDto.title,
          description: createTaskDto.description,
          status: createTaskDto.status,
          userId: mockUserId,
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
      expect(result).toEqual(mockTask);
    });
  });

  describe('findAll', () => {
    it('should return filtered tasks with pagination', async () => {
      const query: TaskQueryDto = {
        status: TaskStatus.TODO,
        limit: 10,
        offset: 0,
      };

      const mockTasks = [mockTask];
      const mockCount = 1;

      mockPrismaService.task.findMany.mockResolvedValue(mockTasks);
      mockPrismaService.task.count.mockResolvedValue(mockCount);

      const result = await service.findAll(query, mockUserId);

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          status: query.status,
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        skip: query.offset,
        take: query.limit,
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(mockPrismaService.task.count).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          status: query.status,
        },
      });

      expect(result).toEqual({
        data: mockTasks,
        total: mockCount,
        offset: query.offset,
        limit: query.limit,
      });
    });

    it('should use default pagination when not provided', async () => {
      const query: TaskQueryDto = {
        status: TaskStatus.TODO,
      };

      const mockTasks = [mockTask];
      const mockCount = 1;

      mockPrismaService.task.findMany.mockResolvedValue(mockTasks);
      mockPrismaService.task.count.mockResolvedValue(mockCount);

      const result = await service.findAll(query, mockUserId);

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
        })
      );

      expect(result).toEqual({
        data: mockTasks,
        total: mockCount,
        offset: 0,
        limit: 10,
      });
    });
  });

  describe('findOne', () => {
    it('should return a task when it exists', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);

      const result = await service.findOne(mockTaskId, mockUserId);

      expect(mockPrismaService.task.findUnique).toHaveBeenCalledWith({
        where: {
          id: mockTaskId,
          userId: mockUserId,
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
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException when task does not exist', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(service.findOne(mockTaskId, mockUserId)).rejects.toThrow(
        NotFoundException
      );
      expect(mockPrismaService.task.findUnique).toHaveBeenCalledWith({
        where: {
          id: mockTaskId,
          userId: mockUserId,
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
    });
  });

  describe('updateTask', () => {
    it('should update a task when it exists and belongs to user', async () => {
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        status: TaskStatus.IN_PROGRESS,
      };

      const updatedTask = {
        ...mockTask,
        title: 'Updated Task',
        status: TaskStatus.IN_PROGRESS,
      };

      mockPrismaService.task.findUnique.mockResolvedValue({ userId: mockUserId });
      mockPrismaService.task.update.mockResolvedValue(updatedTask);

      const result = await service.updateTask(mockTaskId, updateTaskDto, mockUserId);

      expect(mockPrismaService.task.findUnique).toHaveBeenCalledWith({
        where: { id: mockTaskId },
        select: { userId: true },
      });

      expect(mockPrismaService.task.update).toHaveBeenCalledWith({
        where: { id: mockTaskId },
        data: updateTaskDto,
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(updatedTask);
    });

    it('should throw NotFoundException when task does not exist', async () => {
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
      };

      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(
        service.updateTask(mockTaskId, updateTaskDto, mockUserId)
      ).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.task.findUnique).toHaveBeenCalledWith({
        where: { id: mockTaskId },
        select: { userId: true },
      });
      expect(mockPrismaService.task.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when task belongs to another user', async () => {
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
      };

      mockPrismaService.task.findUnique.mockResolvedValue({ userId: 'another-user-id' });

      await expect(
        service.updateTask(mockTaskId, updateTaskDto, mockUserId)
      ).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.task.findUnique).toHaveBeenCalledWith({
        where: { id: mockTaskId },
        select: { userId: true },
      });
      expect(mockPrismaService.task.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteTask', () => {
    it('should delete a task when it exists and belongs to user', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue({ userId: mockUserId });
      mockPrismaService.task.delete.mockResolvedValue(mockTask);

      await service.deleteTask(mockTaskId, mockUserId);

      expect(mockPrismaService.task.findUnique).toHaveBeenCalledWith({
        where: { id: mockTaskId },
        select: { userId: true },
      });
      expect(mockPrismaService.task.delete).toHaveBeenCalledWith({
        where: { id: mockTaskId },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should throw NotFoundException when task does not exist', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(service.deleteTask(mockTaskId, mockUserId)).rejects.toThrow(
        NotFoundException
      );
      expect(mockPrismaService.task.findUnique).toHaveBeenCalledWith({
        where: { id: mockTaskId },
        select: { userId: true },
      });
      expect(mockPrismaService.task.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when task belongs to another user', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue({ userId: 'another-user-id' });

      await expect(service.deleteTask(mockTaskId, mockUserId)).rejects.toThrow(
        NotFoundException
      );
      expect(mockPrismaService.task.findUnique).toHaveBeenCalledWith({
        where: { id: mockTaskId },
        select: { userId: true },
      });
      expect(mockPrismaService.task.delete).not.toHaveBeenCalled();
    });
  });
});
