import { NextFunction, Request, Response } from 'express';
import passport from 'passport';

import { User } from '@/models';
import { PassportStrategy } from '@/passport';

export const localAuthentication = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(PassportStrategy.LOCAL, { session: false }, (err: unknown, user: User) => {
    if (err) return next(err);

    req.user = user;
    next();
  })(req, res, next);
};
