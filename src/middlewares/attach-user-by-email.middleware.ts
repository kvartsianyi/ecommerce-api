import { Request, Response, NextFunction } from 'express';

import { NotFoundException } from '@/exceptions';
import { ERROR_MESSAGES } from '@/constants';
import { emailSchema } from '@/validators';
import { UserModel } from '@/db/models';

export const attachUserByEmail = async (req: Request, res: Response, next: NextFunction) => {
  await emailSchema.validateAsync(req.body);

  const { email } = req.body;
  const user = await UserModel.findByEmail(email);

  if (!user) {
    throw new NotFoundException(ERROR_MESSAGES.USER_DOES_NOT_EXIST);
  }

  req.user = user;

  next();
};
