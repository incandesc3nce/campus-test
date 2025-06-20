import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { HashingService } from '@/shared/hashing/hashing.service';
import { CreateUserDto } from './dto/createUser.dto';
import { User } from 'generated/prisma';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;
  let hashingService: HashingService;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: HashingService,
          useValue: {
            hashPassword: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    hashingService = module.get<HashingService>(HashingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneByEmail', () => {
    it('should return a user by email', async () => {
      const findUniqueSpy = jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(mockUser);

      const result = await service.findOneByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
    it('should throw UnauthorizedException if user not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.findOneByEmail('doesnt_exist@example.com')).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe('findOneById', () => {
    it('should return a user if found', async () => {
      const findUniqueSpy = jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(mockUser);

      const result = await service.findOneById('test-id');

      expect(result).toEqual(mockUser);
      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.findOneById('nonexistent-id')).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe('createUser', () => {
    it('should create and return a new user', async () => {
      const findUniqueSpy = jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(null);
      const hashPasswordSpy = jest
        .spyOn(hashingService, 'hashPassword')
        .mockResolvedValue('hashedPassword123');
      const createSpy = jest
        .spyOn(prismaService.user, 'create')
        .mockResolvedValue(mockUser);

      const result = await service.createUser(mockCreateUserDto);

      expect(result).toEqual(mockUser);
      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { email: mockCreateUserDto.email },
      });
      expect(hashPasswordSpy).toHaveBeenCalledWith(mockCreateUserDto.password);
      expect(createSpy).toHaveBeenCalledWith({
        data: {
          email: mockCreateUserDto.email,
          name: mockCreateUserDto.name,
          passwordHash: 'hashedPassword123',
        },
      });
    });

    it('should throw ConflictException if user with email already exists', async () => {
      const findUniqueSpy = jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(mockUser);
      const createSpy = jest.spyOn(prismaService.user, 'create');

      await expect(service.createUser(mockCreateUserDto)).rejects.toThrow(
        ConflictException
      );
      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { email: mockCreateUserDto.email },
      });
      expect(createSpy).not.toHaveBeenCalled();
    });
  });
});
