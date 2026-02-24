import { Request, Response } from 'express';

import { HttpStatusCode } from '@/constants';
import { cartService } from '@/services';
import { serializeResponse } from '@/utils';

class CartController {
  async getUserCart(req: Request, res: Response): Promise<Response> {
    const user = req.user!;

    await cartService.ensureCartExists(user.id);

    const cart = await cartService.getCartSummary(user.id);

    return res.status(HttpStatusCode.OK).json(serializeResponse(cart));
  }

  async addItemToCart(req: Request, res: Response): Promise<Response> {
    const user = req.user!;
    const cartItemData = req.body;

    const cart = await cartService.addItemToCart(user.id!, cartItemData);

    return res.status(HttpStatusCode.OK).json(serializeResponse(cart));
  }

  async updateCartItem(req: Request, res: Response): Promise<Response> {
    const id = parseInt(req.params.id);
    const user = req.user!;
    const cartItemData = req.body;

    const cart = await cartService.updateCartItem(user.id!, id, cartItemData);

    return res.status(HttpStatusCode.OK).json(serializeResponse(cart));
  }

  async deleteCartItem(req: Request, res: Response): Promise<Response> {
    const id = parseInt(req.params.id);
    const user = req.user!;

    await cartService.deleteCartItem(user.id!, id);

    return res.status(HttpStatusCode.NO_CONTENT).json(serializeResponse({}));
  }
}

export default new CartController();
