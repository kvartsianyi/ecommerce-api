import { eq, getTableColumns } from 'drizzle-orm';

import db from '@/db';
import { users } from '@/db/schema';
import bcryptService from './bcrypt.service';
import { BadRequestException, NotFoundException } from '@/exceptions';
import { ERROR_MESSAGES } from '@/constants';
import { PublicUser, User } from '@/models';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { password, ...publicUserFields } = getTableColumns(users);

class UserService {
  async createUser(userData: User): Promise<PublicUser> {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, userData.email),
    });

    if (existingUser) {
      throw new BadRequestException(ERROR_MESSAGES.USER_ALREADY_EXIST);
    }

    userData.password = await bcryptService.hashPassword(userData.password);

    const [user] = await db.insert(users).values(userData).returning(publicUserFields);

    return user;
  }

  async confirmEmail(userId: number): Promise<PublicUser> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        isEmailConfirmed: true,
      },
    });

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_DOES_NOT_EXIST);
    }

    if (user.isEmailConfirmed) {
      throw new BadRequestException(ERROR_MESSAGES.EMAIL_ALREADY_CONFIRMED);
    }

    const [updatedUser] = await db
      .update(users)
      .set({ isEmailConfirmed: true })
      .where(eq(users.id, userId))
      .returning(publicUserFields);

    if (!updatedUser) {
      throw new NotFoundException(ERROR_MESSAGES.USER_DOES_NOT_EXIST);
    }

    return updatedUser;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }
}

export default new UserService();
