import { Strategy as JwtStrategy, ExtractJwt, StrategyOptionsWithoutRequest } from 'passport-jwt';

import { userService } from '@/services';
import { AuthTokenPairPayload } from '@/models';
import { ERROR_MESSAGES, TokenAction } from '@/constants';
import { TOKEN_CONFIG_MAP } from '@/config';
import { ForbiddenException, UnauthorizedException } from '@/exceptions';

const opts: StrategyOptionsWithoutRequest = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: TOKEN_CONFIG_MAP[TokenAction.USER_REFRESH_TOKEN].SECRET_KEY,
};

const refreshTokenStrategy = new JwtStrategy(opts, async (payload: AuthTokenPairPayload, done) => {
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
});

export default refreshTokenStrategy;
