import { IsNotEmpty, MinLength, MaxLength, IsString } from 'class-validator';
import { BaseAuthDto } from './baseAuth.dto';
import { Match } from '../decorators/match.decorator';

export class RegisterDto extends BaseAuthDto {
  @MinLength(1, { message: 'Name must be at least 1 character long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;

  @Match('password', { message: 'Passwords do not match' })
  @IsNotEmpty({ message: 'Please confirm your password' })
  confirmPassword!: string;
}
