import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export abstract class BaseAuthDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d].+$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  @MaxLength(100, {
    message: 'Password must not exceed 100 characters',
  })
  @MinLength(8, {
    message: 'Password must be at least 8 characters long',
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
