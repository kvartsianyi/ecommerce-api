import userService from './user.service';
import { PublicUser, User } from '@/models';

class AuthService {
  async registration(userData: User): Promise<PublicUser> {
    const user = await userService.createUser(userData);

    return user;
  }
}

export default new AuthService();
