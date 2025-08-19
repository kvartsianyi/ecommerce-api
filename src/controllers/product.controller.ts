import { Request, Response } from 'express';

import { productService } from '@/services';
import { HttpStatusCode } from '@/constants';
import { serializeResponse } from '@/utils';

class ProductController {
  async createProduct(req: Request, res: Response): Promise<Response> {
    const user = req.user!;

    const product = await productService.createProduct(user.id!, req.body);

    return res.status(HttpStatusCode.CREATED).json(serializeResponse(product));
  }
}

export default new ProductController();
