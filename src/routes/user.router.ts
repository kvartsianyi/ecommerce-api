import { Router } from 'express';

import { userController } from '@/controllers';
import { validateBody, wrapAsyncErrors } from '@/middlewares';
import { createUserSchema } from '@/validators';

const userRouter = Router();

userRouter.post('/', validateBody(createUserSchema), wrapAsyncErrors(userController.createUser));

export default userRouter;
