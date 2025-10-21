import { Router } from 'express';

import { jwtAuth, validateIdParam, validateQuery } from '@/middlewares';
import { orderController } from '@/controllers';
import { getOrdersQuery } from '@/validators';

const orderRouter = Router();

orderRouter
  .get('/', jwtAuth, validateQuery(getOrdersQuery), orderController.getOrders)
  .get('/:id', jwtAuth, validateIdParam, orderController.getOrderById)
  .post('/', jwtAuth, orderController.checkout)
  .post('/:id/pay', jwtAuth, validateIdParam, orderController.payOrder);

export default orderRouter;
