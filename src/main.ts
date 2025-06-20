import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app setup
  app.setGlobalPrefix('v1');
  app.enableShutdownHooks();
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  // swagger setup
  const config = new DocumentBuilder()
    .setTitle('Сервис управления задачами (REST API)')
    .setDescription('Тестовое задание для Кампуса')
    .setVersion('1.0')
    .build();

  const document = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // start the application
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
