import { Request, Response } from 'express';

import { userService, mailService, jwtService } from '@/services';
import { HttpStatusCode, AppAction } from '@/constants';
import { serializeResponse } from '@/utils';

class UserController {
  async createUser(req: Request, res: Response): Promise<Response> {
    const user = await userService.createUser(req.body);

    const payload = {
      userId: user.id,
      role: user.role,
      action: AppAction.USER_CONFIRMATION,
    };
    const token = await jwtService.generateToken(AppAction.USER_CONFIRMATION, payload);

    const context = {
      fullName: `${user.firstName} ${user.lastName}`,
      token,
    };
    await mailService.sendMail(user.email, AppAction.USER_CONFIRMATION, context);

    return res.status(HttpStatusCode.CREATED).json(serializeResponse(user));
  }
}

export default new UserController();
