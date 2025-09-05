import { Router } from 'express';

import { jwtAuth, validateBody, validateIdParam } from '@/middlewares';
import { cartController } from '@/controllers';
import { addItemToCartSchema, updateCartItemSchema } from '@/validators';

const cartRouter = Router();
const cartItemsRouter = Router();

cartItemsRouter
  .post('/', jwtAuth, validateBody(addItemToCartSchema), cartController.addItemToCart)
  .patch(
    '/:id',
    jwtAuth,
    validateIdParam,
    validateBody(updateCartItemSchema),
    cartController.updateCartItem,
  );

cartRouter.use('/items', cartItemsRouter);

cartRouter.get('/', jwtAuth, cartController.getUserCart);

export default cartRouter;
