import { NextFunction, Request, Response } from 'express';
import passport from 'passport';

import { User } from '@/models';
import { PassportStrategy } from '@/passport';
import { ERROR_MESSAGES } from '@/constants';
import { UnauthorizedException } from '@/exceptions';

type JwtTokenStrategy = PassportStrategy.ACCESS_TOKEN | PassportStrategy.REFRESH_TOKEN;

const createJwtTokenAuthMiddleware =
  (strategy: JwtTokenStrategy) => (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(strategy, { session: false }, (err: unknown, user: User) => {
      if (err) return next(err);
      if (!user) return next(new UnauthorizedException(ERROR_MESSAGES.TOKEN_INVALID_OR_EXPIRED));

      req.user = user;
      next();
    })(req, res, next);
  };

export const jwtAuth = createJwtTokenAuthMiddleware(PassportStrategy.ACCESS_TOKEN);
export const refreshJwtAuth = createJwtTokenAuthMiddleware(PassportStrategy.REFRESH_TOKEN);
