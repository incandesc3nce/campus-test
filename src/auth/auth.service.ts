import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/users/users.service';
import { JwtPayload } from '@/shared/types/JwtPayload';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/authResponse.dto';
import { HashingService } from '../shared/hashing/hashing.service';
import { User } from 'generated/prisma';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private hashingService: HashingService
  ) {}

  private jwtExpirationTime = '3d';

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    let user: User;

    try {
      user = await this.usersService.findOneByEmail(loginDto.email);
    } catch (error) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValidPassword = await this.hashingService.verifyPassword(
      loginDto.password,
      user.passwordHash
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: JwtPayload = { sub: user.id, email: user.email };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: this.jwtExpirationTime,
      }),
      expiresIn: this.jwtExpirationTime,
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const newUser = await this.usersService.createUser({
      email: registerDto.email,
      name: registerDto.name,
      password: registerDto.password,
    });

    const payload = { sub: newUser.id, email: newUser.email };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: this.jwtExpirationTime,
      }),
      expiresIn: this.jwtExpirationTime,
    };
  }
}
