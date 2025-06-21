import { ApiSchema } from '@nestjs/swagger';
import { BaseAuthDto } from './baseAuth.dto';

@ApiSchema({
  description: 'DTO для входа в аккаунт.',
})
export class LoginDto extends BaseAuthDto {}
