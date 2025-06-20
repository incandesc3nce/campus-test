import { UsersService } from '@/users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { HashingService } from '../shared/hashing/hashing.service';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from '@/shared/types/JwtPayload';
import { AuthResponse } from '@/shared/types/AuthResponse';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private hashingService: HashingService
  ) {}

  private jwtExpirationTime = '3d';

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findOneByEmail(loginDto.email);

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

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
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
