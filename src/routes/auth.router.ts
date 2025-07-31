import { Router } from 'express';

import { authController } from '@/controllers';
import { localAuthentication, validateBody } from '@/middlewares';
import { loginSchema } from '@/validators';

const authRouter = Router();

authRouter.post('/login', validateBody(loginSchema), localAuthentication, authController.login);

export default authRouter;
