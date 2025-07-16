import { eq, getTableColumns } from 'drizzle-orm';
import bcrypt from 'bcrypt';

import db from '@/db';
import { users } from '@/db/schema';
import { BadRequestException } from '@/exceptions';
import { PASSWORD_SALT, ERROR_MESSAGES } from '@/constants';
import { PublicUser, User } from '@/models';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { password, ...publicUserFields } = getTableColumns(users);

class UserService {
  async createUser(userData: User): Promise<PublicUser> {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, userData.email),
    });

    if (existingUser) {
      throw new BadRequestException(ERROR_MESSAGES.USER_ALREADY_EXISTS);
    }

    userData.password = await this.hashPassword(userData.password);

    const [user] = await db.insert(users).values(userData).returning(publicUserFields);

    return user;
  }

  private async hashPassword(password: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, PASSWORD_SALT);

    return hashedPassword;
  }
}

export default new UserService();
