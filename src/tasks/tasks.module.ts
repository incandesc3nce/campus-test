import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { AuthModule } from '@/auth/auth.module';
import { PrismaModule } from '@/shared/prisma/prisma.module';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
