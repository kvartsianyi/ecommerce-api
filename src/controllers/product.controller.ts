import { Request, Response } from 'express';

import { productService } from '@/services';
import { ERROR_MESSAGES, HttpStatusCode } from '@/constants';
import { serializeResponse } from '@/utils';
import { BadRequestException } from '@/exceptions';

class ProductController {
  async createProduct(req: Request, res: Response): Promise<Response> {
    const user = req.user!;

    const product = await productService.createProduct(user.id!, req.body);

    return res.status(HttpStatusCode.CREATED).json(serializeResponse(product));
  }

  async updateProductImage(req: Request, res: Response): Promise<Response> {
    const productId = parseInt(req.params.id);
    const file = req?.file;

    if (!file) {
      throw new BadRequestException(ERROR_MESSAGES.FILE_REQUIRED);
    }

    const product = await productService.updateProductImage(productId, file);

    return res.status(HttpStatusCode.OK).json(serializeResponse(product));
  }
}

export default new ProductController();
