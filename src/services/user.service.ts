import { eq, getTableColumns } from 'drizzle-orm';

import db from '@/db';
import { users } from '@/db/schema';
import bcryptService from './bcrypt.service';
import { BadRequestException, NotFoundException } from '@/exceptions';
import { ERROR_MESSAGES } from '@/constants';
import { PublicUser, User } from '@/models';

type FindByIdOptions = { isPublic?: false } | { isPublic: true };

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

  toPublicUser(user: User): PublicUser {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...publicUser } = user;

    return publicUser;
  }

  async findById<T extends FindByIdOptions>(
    id: number,
    options?: T,
  ): Promise<T extends { isPublic: true } ? PublicUser | undefined : User | undefined> {
    const isPublic = options?.isPublic ?? false;
    const publicFields = Object.fromEntries(Object.keys(publicUserFields).map(key => [key, true]));

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      ...(isPublic ? { columns: publicFields } : {}),
    });

    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }
}

export default new UserService();
