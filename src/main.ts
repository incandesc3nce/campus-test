import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // setup
  app.setGlobalPrefix('v1');
  app.enableShutdownHooks();
  app.enableCors();

  // start the application
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
