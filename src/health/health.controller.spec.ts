import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { ServiceUnavailableException } from '@nestjs/common';

describe('HealthController', () => {
  let controller: HealthController;
  let _healthService: HealthService;

  const mockHealthService = {
    checkHealth: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: mockHealthService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    _healthService = module.get<HealthService>(HealthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkHealth', () => {
    it('should return status OK when health service returns OK', async () => {
      mockHealthService.checkHealth.mockResolvedValueOnce({ message: 'OK' });

      const result = await controller.checkHealth();

      expect(result).toEqual({ message: 'OK' });
      expect(mockHealthService.checkHealth).toHaveBeenCalledTimes(1);
    });

    it('should propagate exceptions from health service', async () => {
      const serviceError = new ServiceUnavailableException('ERROR');
      mockHealthService.checkHealth.mockRejectedValueOnce(serviceError);

      await expect(controller.checkHealth()).rejects.toThrow(ServiceUnavailableException);
      expect(mockHealthService.checkHealth).toHaveBeenCalledTimes(1);
    });
  });
});
