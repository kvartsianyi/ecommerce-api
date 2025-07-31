import { NextFunction, Request, Response } from 'express';
import passport from 'passport';

import { User } from '@/models';
import { PassportStrategy } from '@/passport';
import { ERROR_MESSAGES } from '@/constants';
import { UnauthorizedException } from '@/exceptions';

export const refreshTokenAuthentication = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    PassportStrategy.REFRESH_TOKEN,
    { session: false },
    (err: unknown, user: User) => {
      if (err) return next(err);
      if (!user) return next(new UnauthorizedException(ERROR_MESSAGES.TOKEN_INVALID_OR_EXPIRED));

      req.user = user;
      next();
    },
  )(req, res, next);
};
