import { INestApplication, ValidationPipe } from '@nestjs/common';
import { App } from 'supertest/types';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/shared/prisma/prisma.service';

export async function setupTestApp(): Promise<INestApplication<App>> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      AppModule,
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env.test',
      }),
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  const prismaService = moduleFixture.get<PrismaService>(PrismaService);

  await prismaService.$transaction(async (tx) => {
    const tableNames = await tx.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name != '_prisma_migrations'
    `;

    for (const { table_name } of tableNames) {
      await tx.$executeRawUnsafe(
        `TRUNCATE TABLE "${table_name}" RESTART IDENTITY CASCADE`
      );
    }
  });

  return await app.init();
}
