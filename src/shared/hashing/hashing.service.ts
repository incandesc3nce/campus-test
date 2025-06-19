import { Injectable } from '@nestjs/common';
import { hash, verify } from 'argon2';

@Injectable()
export class HashingService {
  private HASH_SECRET = Buffer.from(process.env.HASH_SECRET!);

  async hashPassword(password: string): Promise<string> {
    const hashedPassword = await hash(password, {
      secret: this.HASH_SECRET,
    });
    return hashedPassword;
  }

  async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await verify(hashedPassword, password, {
      secret: this.HASH_SECRET,
    });
  }
}
