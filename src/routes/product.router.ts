import { Router } from 'express';

import { productController } from '@/controllers';
import { jwtAuth, requireAdmin, validateBody } from '@/middlewares';
import { createProductSchema } from '@/validators';

const productRouter = Router();

productRouter.post(
  '/',
  jwtAuth,
  requireAdmin,
  validateBody(createProductSchema),
  productController.createProduct,
);

export default productRouter;
