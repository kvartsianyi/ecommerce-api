import { Router } from 'express';

import { jwtAuth, validateBody, validateIdParam, validateQuery } from '@/middlewares';
import { orderController } from '@/controllers';
import { checkoutSchema, getOrdersQuery } from '@/validators';

const orderRouter = Router();

orderRouter
  .get('/', jwtAuth, validateQuery(getOrdersQuery), orderController.getOrders)
  .get('/:id', jwtAuth, validateIdParam, orderController.getOrderById)
  .post('/', jwtAuth, validateBody(checkoutSchema), orderController.checkout)
  .post('/:id/pay', jwtAuth, validateIdParam, orderController.payOrder);

export default orderRouter;
