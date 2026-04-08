import { InternalServerErrorException } from '@nestjs/common';
import bcrypt from 'bcryptjs';

export class PasswordUtil {
  private static readonly SALT_ROUNDS = 10;

  static async hashPassword(password: string) {
    try {
      return await bcrypt.hash(password, this.SALT_ROUNDS);
    } catch {
      throw new InternalServerErrorException('Failed to hash password');
    }
  }

  static async comparePassword(plainPassword: string, hashedPassword: string) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch {
      throw new InternalServerErrorException('Failed to compare password');
    }
  }
}
