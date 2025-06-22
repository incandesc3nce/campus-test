import { PrismaService } from '@/shared/prisma/prisma.service';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';

@Injectable()
export class HealthService {
  constructor(private prismaService: PrismaService) {}

  async checkHealth(): Promise<{ message: string }> {
    try {
      await this.prismaService.$queryRaw`SELECT 1`;
      console.log('Health Check OK');
      return { message: 'OK' };
    } catch (error) {
      console.error('Health Check Error:', error);
      throw new ServiceUnavailableException('ERROR');
    }
  }
}
