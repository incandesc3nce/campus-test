import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/createTask.dto';
import { UpdateTaskDto } from './dto/updateTask.dto';
import { TaskQueryDto } from './dto/taskQuery.dto';
import { JwtPayload } from '@/shared/types/JwtPayload';
import { TaskStatus } from 'generated/prisma';
import { NotFoundException } from '@nestjs/common';
import { TaskResponseDto } from './dto/taskResponse.dto';
import { FilteredTasksResponseDto } from './dto/filteredTaskResponse.dto';
import { validate } from 'class-validator';
import { JwtService } from '@nestjs/jwt';

describe('TasksController', () => {
  let controller: TasksController;
  let _service: TasksService;
  let _jwtService: JwtService;

  const mockTasksService = {
    createTask: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
  };

  const mockUser: JwtPayload = {
    sub: 'user-123',
    email: 'test@example.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        { provide: TasksService, useValue: mockTasksService },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    _service = module.get<TasksService>(TasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const create = mockTasksService.createTask;
    it('should create a new task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'Task Description',
        status: TaskStatus.TODO,
      };

      const expectedResult: TaskResponseDto = {
        id: 'task-123',
        title: 'New Task',
        description: 'Task Description',
        status: TaskStatus.TODO,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      create.mockResolvedValue(expectedResult);

      const result = await controller.create(createTaskDto, mockUser);

      expect(create).toHaveBeenCalledWith(createTaskDto, mockUser.sub);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    const findAll = mockTasksService.findAll;

    it('should return filtered tasks with pagination', async () => {
      const query: TaskQueryDto = {
        status: TaskStatus.TODO,
        limit: 10,
        offset: 0,
      };

      const expectedResult: FilteredTasksResponseDto = {
        data: [
          {
            id: 'task-123',
            title: 'Task 1',
            description: 'Description 1',
            status: TaskStatus.TODO,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 1,
        limit: 10,
        offset: 0,
      };

      findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query, mockUser);

      expect(findAll).toHaveBeenCalledWith(query, mockUser.sub);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    const findOne = mockTasksService.findOne;

    it('should return a task by id', async () => {
      const taskId = 'task-123';
      const expectedResult: TaskResponseDto = {
        id: taskId,
        title: 'Task 1',
        description: 'Description 1',
        status: TaskStatus.TODO,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(taskId, mockUser);

      expect(findOne).toHaveBeenCalledWith(taskId, mockUser.sub);
      expect(result).toEqual(expectedResult);
    });

    it('should propagate NotFoundException when task is not found', async () => {
      const taskId = 'non-existent-task';
      findOne.mockRejectedValue(new NotFoundException('Task not found'));

      await expect(controller.findOne(taskId, mockUser)).rejects.toThrow(
        NotFoundException
      );
      expect(findOne).toHaveBeenCalledWith(taskId, mockUser.sub);
    });
  });

  describe('update', () => {
    const updateTask = mockTasksService.updateTask;

    it('should update a task', async () => {
      const taskId = 'task-123';
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        status: TaskStatus.IN_PROGRESS,
      };

      const expectedResult: TaskResponseDto = {
        id: taskId,
        title: 'Updated Task',
        description: 'Description',
        status: TaskStatus.IN_PROGRESS,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      updateTask.mockResolvedValue(expectedResult);

      const result = await controller.update(taskId, updateTaskDto, mockUser);

      expect(updateTask).toHaveBeenCalledWith(taskId, updateTaskDto, mockUser.sub);
      expect(result).toEqual(expectedResult);
    });

    it('should propagate NotFoundException when task to update is not found', async () => {
      const taskId = 'non-existent-task';
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
      };

      updateTask.mockRejectedValue(new NotFoundException('Task not found'));

      await expect(controller.update(taskId, updateTaskDto, mockUser)).rejects.toThrow(
        NotFoundException
      );
      expect(updateTask).toHaveBeenCalledWith(taskId, updateTaskDto, mockUser.sub);
    });
  });

  describe('delete', () => {
    const deleteTask = mockTasksService.deleteTask;

    it('should delete a task', async () => {
      const taskId = 'task-123';
      deleteTask.mockResolvedValue(undefined);

      await controller.delete(taskId, mockUser);

      expect(deleteTask).toHaveBeenCalledWith(taskId, mockUser.sub);
    });

    it('should propagate NotFoundException when task to delete is not found', async () => {
      const taskId = 'non-existent-task';
      deleteTask.mockRejectedValue(new NotFoundException('Task not found'));

      await expect(controller.delete(taskId, mockUser)).rejects.toThrow(
        NotFoundException
      );
      expect(deleteTask).toHaveBeenCalledWith(taskId, mockUser.sub);
    });
  });

  describe('DTO Validation', () => {
    describe('CreateTaskDto', () => {
      it('should validate a valid CreateTaskDto', async () => {
        const createTaskDto = {
          title: 'Valid Title',
          description: 'Valid Description',
          status: TaskStatus.TODO,
        };

        const errors = await validate(Object.assign(new CreateTaskDto(), createTaskDto));
        expect(errors.length).toBe(0);
      });

      it('should require title', async () => {
        const createTaskDto = {
          description: 'Valid Description',
          status: TaskStatus.TODO,
        };

        const errors = await validate(Object.assign(new CreateTaskDto(), createTaskDto));
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isNotEmpty');
      });

      it('should validate title is a string', async () => {
        const createTaskDto = {
          title: 123,
          description: 'Valid Description',
          status: TaskStatus.TODO,
        };

        const errors = await validate(Object.assign(new CreateTaskDto(), createTaskDto));
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isString');
      });

      it('should allow optional description', async () => {
        const createTaskDto = {
          title: 'Valid Title',
          status: TaskStatus.TODO,
        };

        const errors = await validate(Object.assign(new CreateTaskDto(), createTaskDto));
        expect(errors.length).toBe(0);
      });

      it('should validate description is a string when provided', async () => {
        const createTaskDto = {
          title: 'Valid Title',
          description: 123,
          status: TaskStatus.TODO,
        };

        const errors = await validate(Object.assign(new CreateTaskDto(), createTaskDto));
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isString');
      });

      it('should validate status is a valid enum value', async () => {
        const createTaskDto = {
          title: 'Valid Title',
          status: 'INVALID_STATUS',
        };

        const errors = await validate(Object.assign(new CreateTaskDto(), createTaskDto));
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isEnum');
      });
    });

    describe('TaskQueryDto', () => {
      it('should validate a valid TaskQueryDto', async () => {
        const taskQueryDto = {
          status: TaskStatus.TODO,
          limit: 20,
          offset: 5,
        };

        const errors = await validate(Object.assign(new TaskQueryDto(), taskQueryDto));
        expect(errors.length).toBe(0);
      });

      it('should allow empty query with default values', async () => {
        const taskQueryDto = {};

        const errors = await validate(Object.assign(new TaskQueryDto(), taskQueryDto));
        expect(errors.length).toBe(0);
      });

      it('should validate status is a valid enum value when provided', async () => {
        const taskQueryDto = {
          status: 'INVALID_STATUS',
        };

        const errors = await validate(Object.assign(new TaskQueryDto(), taskQueryDto));
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isEnum');
      });

      it('should validate limit is a number', async () => {
        const taskQueryDto = {
          limit: 'not-a-number',
        };

        const errors = await validate(Object.assign(new TaskQueryDto(), taskQueryDto));
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isInt');
      });

      it('should validate limit is at least 1', async () => {
        const taskQueryDto = {
          limit: 0,
        };

        const errors = await validate(Object.assign(new TaskQueryDto(), taskQueryDto));
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('min');
      });

      it('should validate offset is a number', async () => {
        const taskQueryDto = {
          offset: 'not-a-number',
        };

        const errors = await validate(Object.assign(new TaskQueryDto(), taskQueryDto));
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isInt');
      });

      it('should validate offset is at least 0', async () => {
        const taskQueryDto = {
          offset: -1,
        };

        const errors = await validate(Object.assign(new TaskQueryDto(), taskQueryDto));
        expect(errors.length).toBeGreaterThanOrEqual(0);
        expect(errors[0].constraints).toHaveProperty('min');
      });
    });

    describe('UpdateTaskDto', () => {
      it('should validate a valid UpdateTaskDto', async () => {
        const updateTaskDto = {
          title: 'Updated Title',
          description: 'Updated Description',
          status: TaskStatus.IN_PROGRESS,
        };

        const errors = await validate(Object.assign(new UpdateTaskDto(), updateTaskDto));
        expect(errors.length).toBe(0);
      });

      it('should allow empty update (partial)', async () => {
        const updateTaskDto = {};

        const errors = await validate(Object.assign(new UpdateTaskDto(), updateTaskDto));
        expect(errors.length).toBe(0);
      });

      it('should validate title is a string when provided', async () => {
        const updateTaskDto = {
          title: 123,
        };

        const errors = await validate(Object.assign(new UpdateTaskDto(), updateTaskDto));
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isString');
      });

      it('should validate description is a string when provided', async () => {
        const updateTaskDto = {
          description: 123,
        };

        const errors = await validate(Object.assign(new UpdateTaskDto(), updateTaskDto));
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isString');
      });

      it('should validate status is a valid enum value when provided', async () => {
        const updateTaskDto = {
          status: 'INVALID_STATUS',
        };

        const errors = await validate(Object.assign(new UpdateTaskDto(), updateTaskDto));
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isEnum');
      });
    });
  });
});
