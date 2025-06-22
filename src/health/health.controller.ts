import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Проверка состояния сервиса')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * Проверка состояния сервиса
   *
   * @remarks Возвращает статус сервиса. Если сервис работает корректно, возвращает статус OK.
   * Если сервис не работает, возвращает 503 Service Unavailable.
   */
  @Get()
  @ApiResponse({
    status: 200,
    description: 'Сервис работает корректно',
    example: {
      message: 'OK',
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Сервис не работает',
    example: {
      message: 'ERROR',
      error: 'Service Unavailable',
      statusCode: 503,
    },
  })
  async checkHealth() {
    return this.healthService.checkHealth();
  }
}
