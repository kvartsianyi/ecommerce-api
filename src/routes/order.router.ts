import { Router } from 'express';

import { jwtAuth, validateIdParam } from '@/middlewares';
import { orderController } from '@/controllers';

const orderRouter = Router();

orderRouter
  .get('/:id', jwtAuth, validateIdParam, orderController.getOrderById)
  .post('/', jwtAuth, orderController.checkout);

export default orderRouter;
