import { Strategy as LocalStrategy } from 'passport-local';

import { ERROR_MESSAGES } from '@/constants';
import { ForbiddenException, UnauthorizedException } from '@/exceptions';
import { UserModel } from '@/db/models';

const localStrategy = new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await UserModel.findByEmail(email);
      if (!user) return done(new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS), false);

      const arePasswordsEqual = await UserModel.comparePasswords(password, user.password);
      if (!arePasswordsEqual)
        return done(new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS), false);

      if (!user.isEmailConfirmed) {
        return done(new ForbiddenException(ERROR_MESSAGES.ACCOUNT_NOT_ACTIVATED), false);
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  },
);

export default localStrategy;
