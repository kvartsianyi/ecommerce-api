import { Request, Response } from 'express';

import { HttpStatusCode } from '@/constants';
import { serializeResponse } from '@/utils';
import { orderService } from '@/services';

class OrderController {
  async getOrders(req: Request, res: Response): Promise<Response> {
    const orderFilters = req.query;
    const user = req.user!;

    const { data, ...paginationMeta } = await orderService.getOrders(user.id, orderFilters);

    return res.status(HttpStatusCode.OK).json(serializeResponse(data, paginationMeta));
  }

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

    const { paymentUrl } = await orderService.payOrder(orderId, user.id);

    return res.status(HttpStatusCode.OK).json(serializeResponse({ paymentUrl }));
  }
}

export default new OrderController();
