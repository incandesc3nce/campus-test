import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from '@/shared/prisma/prisma.module';
import { HashingModule } from '@/shared/hashing/hashing.module';

@Module({
  imports: [PrismaModule, HashingModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
