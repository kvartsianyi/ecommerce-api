import { Strategy as LocalStrategy } from 'passport-local';

import { userService, bcryptService } from '@/services';
import { ERROR_MESSAGES } from '@/constants';
import { ForbiddenException, UnauthorizedException } from '@/exceptions';

const localStrategy = new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await userService.findByEmail(email);
      if (!user) return done(new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS), false);

      const arePasswordsEqual = await bcryptService.comparePasswords(password, user.password);
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
