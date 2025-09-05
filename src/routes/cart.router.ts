import { Router } from 'express';

import { jwtAuth, validateBody } from '@/middlewares';
import { cartController } from '@/controllers';
import { addItemToCartSchema } from '@/validators';

const cartRouter = Router();
const cartItemsRouter = Router();

cartItemsRouter.post('/', jwtAuth, validateBody(addItemToCartSchema), cartController.addItemToCart);

cartRouter.use('/items', cartItemsRouter);

cartRouter.get('/', jwtAuth, cartController.getUserCart);

export default cartRouter;
