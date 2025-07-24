import { Router } from 'express';

import { userController } from '@/controllers';
import { attachUserByEmail, validateBody } from '@/middlewares';
import { createUserSchema, tokenSchema } from '@/validators';

const userRouter = Router();

userRouter
  .post('/', validateBody(createUserSchema), userController.createUser)
  .post('/email-confirm', validateBody(tokenSchema), userController.confirmEmail)
  .post('/email-confirm/send', attachUserByEmail, userController.sendConfirmEmail);

export default userRouter;
