import { Request, Response, NextFunction } from 'express';

import { UserRole } from '@/constants';
import { ForbiddenException } from '@/exceptions';
import { ERROR_MESSAGES } from '@/constants';

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  // REQUIRE: auth middleware to use before it

  if (req?.user?.role !== UserRole.ADMIN) {
    throw new ForbiddenException(ERROR_MESSAGES.ADMIN_ROLE_REQUIRED);
  }

  next();
};
