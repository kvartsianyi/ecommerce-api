import { Router } from 'express';

import { jwtAuth } from '@/middlewares';
import { orderController } from '@/controllers';

const orderRouter = Router();

orderRouter.post('/', jwtAuth, orderController.checkout);

export default orderRouter;
