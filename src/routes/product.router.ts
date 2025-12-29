import { Router } from 'express';

import { productController } from '@/controllers';
import { createProductSchema, getProductsQuery, updateProductSchema } from '@/validators';
import {
  jwtAuth,
  requireAdmin,
  validateBody,
  validateIdParam,
  uploadProductImage,
  validateQuery,
} from '@/middlewares';

const productRouter = Router();

productRouter
  .get('/', validateQuery(getProductsQuery), productController.getProducts)
  .get('/:id', validateIdParam, productController.getProductById)
  .post(
    '/',
    jwtAuth,
    requireAdmin,
    validateBody(createProductSchema),
    productController.createProduct,
  )
  .patch(
    '/:id',
    jwtAuth,
    requireAdmin,
    validateIdParam,
    validateBody(updateProductSchema),
    productController.updateProduct,
  )
  .put(
    '/:id/image',
    jwtAuth,
    requireAdmin,
    validateIdParam,
    uploadProductImage,
    productController.updateProductImage,
  )
  .delete('/:id', jwtAuth, requireAdmin, validateIdParam, productController.deleteProduct);

export default productRouter;
