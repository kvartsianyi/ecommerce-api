import { BadRequestException, NotFoundException } from '@/exceptions';
import { ERROR_MESSAGES, TokenAction, UserRole } from '@/constants';
import { AuthTokenPairPayload, PublicUser, TokenPair, User } from '@/models';
import jwtService from './jwt.service';
import { UserModel } from '@/db/models';

class UserService {
  async createUser(userData: User): Promise<PublicUser> {
    const existingUser = await UserModel.findByEmail(userData.email);

    if (existingUser) {
      throw new BadRequestException(ERROR_MESSAGES.USER_ALREADY_EXIST);
    }

    const user = await UserModel.create(userData);

    return this.toPublicUser(user);
  }

  async confirmEmail(userId: number): Promise<TokenPair> {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_DOES_NOT_EXIST);
    }

    if (user.isEmailConfirmed) {
      throw new BadRequestException(ERROR_MESSAGES.EMAIL_ALREADY_CONFIRMED);
    }

    await UserModel.updateById(userId, { isEmailConfirmed: true });

    const payload: AuthTokenPairPayload = {
      userId: user.id!,
      role: user.role as UserRole,
    };
    const tokenPair = await jwtService.generateTokenPair(payload, {
      accessTokenAction: TokenAction.USER_ACCESS_TOKEN,
      refreshTokenAction: TokenAction.USER_REFRESH_TOKEN,
    });

    return tokenPair;
  }

  toPublicUser(user: User): PublicUser {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...publicUser } = user;

    return publicUser;
  }
}

export default new UserService();
