import { PrismaService } from '@/shared/prisma/prisma.service';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'generated/prisma';
import { CreateUserDto } from './dto/createUser.dto';
import { HashingService } from '@/shared/hashing/hashing.service';

@Injectable()
export class UsersService {
  constructor(
    private prismaService: PrismaService,
    private hashingService: HashingService
  ) {}

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findOneById(id: string): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async createUser(data: CreateUserDto): Promise<User> {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await this.hashingService.hashPassword(data.password);

    return this.prismaService.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
      },
    });
  }
}
