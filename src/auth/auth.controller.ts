import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Throttle } from '@nestjs/throttler';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiDocumentAuthLogin,
  ApiDocumentAuthRegister,
} from './decorators/apiDocumentAuth.decorator';

@ApiTags('Аутентификация')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Вход в аккаунт существующего пользователя
   *
   * @remarks Проверяет email и пароль пользователя, возвращает JWT и время истечения при успешной аутентификации.
   */
  @ApiDocumentAuthLogin()
  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Регистрация нового пользователя
   *
   * @remarks Создает нового пользователя с указанным email, именем и паролем, возвращает JWT и время истечения при успешной регистрации.
   *
   */
  @ApiDocumentAuthRegister()
  @Post('register')
  @HttpCode(201)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}
