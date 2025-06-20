import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { HashingService } from '@/shared/hashing/hashing.service';
import { CreateUserDto } from './dto/createUser.dto';
import { User } from 'generated/prisma';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let _prismaService: PrismaService;
  let _hashingService: HashingService;

  const mockUser: User = {
    id: 'test-id',
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: 'hashedPassword123',
  };

  const mockCreateUserDto: CreateUserDto = {
    email: 'test@example.com',
    name: 'Test User',
    password: 'Password123',
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockHashingService = {
    hashPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: HashingService,
          useValue: mockHashingService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    _prismaService = module.get<PrismaService>(PrismaService);
    _hashingService = module.get<HashingService>(HashingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneByEmail', () => {
    const findUnique = mockPrismaService.user.findUnique;

    it('should return a user by email', async () => {
      findUnique.mockResolvedValue(mockUser);

      const result = await service.findOneByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      findUnique.mockResolvedValue(null);

      await expect(service.findOneByEmail('doesnt_exist@example.com')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('findOneById', () => {
    const findUnique = mockPrismaService.user.findUnique;

    it('should return a user if found', async () => {
      findUnique.mockResolvedValue(mockUser);

      const result = await service.findOneById('test-id');

      expect(result).toEqual(mockUser);
      expect(findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      findUnique.mockResolvedValue(null);

      await expect(service.findOneById('nonexistent-id')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('createUser', () => {
    const findUnique = mockPrismaService.user.findUnique;
    const create = mockPrismaService.user.create;
    const hashPassword = mockHashingService.hashPassword;

    it('should create and return a new user', async () => {
      findUnique.mockResolvedValue(null);
      create.mockResolvedValue(mockUser);
      hashPassword.mockResolvedValue('hashedPassword123');

      const result = await service.createUser(mockCreateUserDto);

      expect(result).toEqual(mockUser);
      expect(findUnique).toHaveBeenCalledWith({
        where: { email: mockCreateUserDto.email },
      });
      expect(hashPassword).toHaveBeenCalledWith(mockCreateUserDto.password);
      expect(create).toHaveBeenCalledWith({
        data: {
          email: mockCreateUserDto.email,
          name: mockCreateUserDto.name,
          passwordHash: 'hashedPassword123',
        },
      });
    });

    it('should throw ConflictException if user with email already exists', async () => {
      findUnique.mockResolvedValue(mockUser);
      create.mockResolvedValue(mockUser);

      await expect(service.createUser(mockCreateUserDto)).rejects.toThrow(
        ConflictException
      );
      expect(findUnique).toHaveBeenCalledWith({
        where: { email: mockCreateUserDto.email },
      });
      expect(create).toHaveBeenCalled();
    });
  });
});
