import { Request, Response } from 'express';

import { HttpStatusCode } from '@/constants';
import { serializeResponse } from '@/utils';
import { orderService } from '@/services';

class OrderController {
  async checkout(req: Request, res: Response): Promise<Response> {
    const user = req.user!;

    const order = await orderService.checkout(user.id);

    return res.status(HttpStatusCode.OK).json(serializeResponse(order));
  }

  async getOrderById(req: Request, res: Response): Promise<Response> {
    const orderId = parseInt(req.params.id);
    const user = req.user!;

    const order = await orderService.getOrderById(orderId, user.id);

    return res.status(HttpStatusCode.OK).json(serializeResponse(order));
  }

  async payOrder(req: Request, res: Response): Promise<Response> {
    const orderId = parseInt(req.params.id);
    const user = req.user!;

    const paymentIntentId = await orderService.payOrder(orderId, user.id);

    return res.status(HttpStatusCode.OK).json(serializeResponse({ paymentIntentId }));
  }
}

export default new OrderController();
