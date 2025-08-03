import { Router } from 'express';

import { authController } from '@/controllers';
import { localAuth, refreshJwtAuth, validateBody } from '@/middlewares';
import { loginSchema } from '@/validators';

const authRouter = Router();

authRouter
  .post('/login', validateBody(loginSchema), localAuth, authController.login)
  .post('/refresh', refreshJwtAuth, authController.tokenRefresh);

export default authRouter;
