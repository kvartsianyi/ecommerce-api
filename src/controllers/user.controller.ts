import { Request, Response } from 'express';

import { userService } from '@/services';
import { HttpStatusCode } from '@/constants';
import { serializeResponse } from '@/utils';

class UserController {
  async createUser(req: Request, res: Response): Promise<Response> {
    const userData = req.body;
    const user = await userService.createUser(userData);

    return res.status(HttpStatusCode.CREATED).json(serializeResponse(user));
  }
}

export default new UserController();
