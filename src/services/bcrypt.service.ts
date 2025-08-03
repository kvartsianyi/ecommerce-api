import bcrypt from 'bcrypt';

import { PASSWORD_SALT } from '@/constants';

class BcryptService {
  async hashPassword(password: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, PASSWORD_SALT);

    return hashedPassword;
  }

  async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    const isEqual = await bcrypt.compare(password, hashedPassword);

    return isEqual;
  }
}

export default new BcryptService();
