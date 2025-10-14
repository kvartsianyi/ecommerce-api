import { Request, Response } from 'express';

import { HttpStatusCode } from '@/constants';
import { serializeResponse } from '@/utils';
import { orderService } from '@/services';

class OrderController {
  async checkout(req: Request, res: Response): Promise<Response> {
    const user = req.user!;

    const order = await orderService.checkout(user.id);

    return res.status(HttpStatusCode.CREATED).json(serializeResponse(order));
  }
}

export default new OrderController();
