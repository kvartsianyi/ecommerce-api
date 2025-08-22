import { Router } from 'express';

import { productController } from '@/controllers';
import { createProductSchema } from '@/validators';
import {
  jwtAuth,
  requireAdmin,
  validateBody,
  validateIdParam,
  uploadProductImage,
} from '@/middlewares';

const productRouter = Router();

productRouter
  .post(
    '/',
    jwtAuth,
    requireAdmin,
    validateBody(createProductSchema),
    productController.createProduct,
  )
  .post(
    '/:id/image',
    jwtAuth,
    requireAdmin,
    validateIdParam,
    uploadProductImage,
    productController.updateProductImage,
  )
  .delete('/:id', jwtAuth, requireAdmin, validateIdParam, productController.deleteProduct);

export default productRouter;
