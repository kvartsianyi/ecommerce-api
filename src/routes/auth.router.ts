import { Router } from 'express';

import { userController } from '@/controllers';
import { validateBody, wrapAsyncErrors } from '@/middlewares';
import { createUserSchema } from '@/validators';

const authRouter = Router();

authRouter.post('/register', validateBody(createUserSchema), wrapAsyncErrors(userController.createUser));

export default authRouter;
