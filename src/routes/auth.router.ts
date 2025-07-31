import { Router } from 'express';

import { authController } from '@/controllers';
import { localAuthentication, refreshTokenAuthentication, validateBody } from '@/middlewares';
import { loginSchema } from '@/validators';

const authRouter = Router();

authRouter
  .post('/login', validateBody(loginSchema), localAuthentication, authController.login)
  .post('/refresh', refreshTokenAuthentication, authController.tokenRefresh);

export default authRouter;
