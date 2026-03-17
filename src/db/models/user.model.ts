import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

import { User } from '@/models';
import { users } from '../schema';
import { BaseModel } from './base.model';
import { PASSWORD_SALT } from '@/constants';

export class UserModel extends BaseModel {
  static async findById(id: number) {
    return this.db.query.users.findFirst({
      where: { id },
    });
  }

  static async findByEmail(email: string) {
    return this.db.query.users.findFirst({
      where: { email },
    });
  }

  static async create(dto: User) {
    const [user] = await this.db
      .insert(users)
      .values({
        ...dto,
        password: await UserModel.hashPassword(dto.password),
      })
      .returning();

    return user;
  }

  static async updateById(id: number, dto: Partial<User>) {
    const [user] = await this.db.update(users).set(dto).where(eq(users.id, id)).returning();

    return user;
  }

  static async updatePassword(id: number, password: string) {
    const [user] = await this.db
      .update(users)
      .set({ password: await UserModel.hashPassword(password) })
      .where(eq(users.id, id))
      .returning();

    return user;
  }

  static async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    const isEqual = await bcrypt.compare(password, hashedPassword);

    return isEqual;
  }

  private static async hashPassword(password: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, PASSWORD_SALT);

    return hashedPassword;
  }
}
