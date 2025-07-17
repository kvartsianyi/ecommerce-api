import { Router } from 'express';

import { userController } from '@/controllers';
import { validateBody, wrapAsyncErrors } from '@/middlewares';
import { createUserSchema, tokenSchema } from '@/validators';

const userRouter = Router();

userRouter
  .post('/', validateBody(createUserSchema), wrapAsyncErrors(userController.createUser))
  .post('/email-confirm', validateBody(tokenSchema), wrapAsyncErrors(userController.confirmEmail));

export default userRouter;
