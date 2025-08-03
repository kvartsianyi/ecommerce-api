import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

import { userService } from '@/services';
import { AuthTokenPairPayload } from '@/models';
import { ERROR_MESSAGES } from '@/constants';
import { ForbiddenException, UnauthorizedException } from '@/exceptions';

const jwtTokenStrategy = (secretOrKey: string | Buffer<ArrayBufferLike>) =>
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey,
    },
    async (payload: AuthTokenPairPayload, done) => {
      try {
        const user = await userService.findById(payload.userId);

        if (!user)
          return done(new UnauthorizedException(ERROR_MESSAGES.TOKEN_INVALID_OR_EXPIRED), false);

        if (!user.isEmailConfirmed) {
          return done(new ForbiddenException(ERROR_MESSAGES.ACCOUNT_NOT_ACTIVATED), false);
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    },
  );

export default jwtTokenStrategy;
