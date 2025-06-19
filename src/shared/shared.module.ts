import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { HashingModule } from './hashing/hashing.module';

@Module({
  imports: [PrismaModule, HashingModule],
  exports: [PrismaModule, HashingModule],
})
export class SharedModule {}
