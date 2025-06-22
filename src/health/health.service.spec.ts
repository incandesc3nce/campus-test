import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { ServiceUnavailableException } from '@nestjs/common';

describe('HealthService', () => {
  let service: HealthService;
  let _prismaService: PrismaService;

  const mockPrismaService = {
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    _prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkHealth', () => {
    it('should return status OK when database is connected', async () => {
      mockPrismaService.$queryRaw.mockResolvedValueOnce([{ 1: 1 }]);

      const result = await service.checkHealth();

      expect(result).toEqual({ message: 'OK' });
      expect(mockPrismaService.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should throw ServiceUnavailableException when database connection fails', async () => {
      const dbError = new Error('Database connection error');
      mockPrismaService.$queryRaw.mockRejectedValueOnce(dbError);

      await expect(service.checkHealth()).rejects.toThrow(ServiceUnavailableException);
      expect(mockPrismaService.$queryRaw).toHaveBeenCalledTimes(1);
    });
  });
});
