import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { userService, mailService, jwtService } from '@/services';
import { HttpStatusCode, AppAction, UserRole, ERROR_MESSAGES } from '@/constants';
import { serializeResponse } from '@/utils';
import { EmailConfirmTokenPayload } from '@/models';
import { BadRequestException } from '@/exceptions';

class UserController {
  async createUser(req: Request, res: Response): Promise<Response> {
    const user = await userService.createUser(req.body);

    const payload: EmailConfirmTokenPayload = {
      userId: user.id!,
      role: user.role as UserRole,
      action: AppAction.USER_CONFIRMATION,
    };
    const token = await jwtService.generateToken(payload, AppAction.USER_CONFIRMATION);

    const context = {
      fullName: `${user.firstName} ${user.lastName}`,
      token,
    };
    await mailService.sendMail(user.email, AppAction.USER_CONFIRMATION, context);

    return res.status(HttpStatusCode.CREATED).json(serializeResponse(user));
  }

  async confirmEmail(req: Request, res: Response): Promise<Response> {
    const { token } = req.body;
    let payload: EmailConfirmTokenPayload;

    try {
      payload = await jwtService.verifyToken(token, AppAction.USER_CONFIRMATION);
    } catch (err) {
      if (err instanceof jwt.JsonWebTokenError) {
        throw new BadRequestException(ERROR_MESSAGES.TOKEN_INVALID_OR_EXPIRED);
      }

      throw err;
    }

    if (payload.action !== AppAction.USER_CONFIRMATION) {
      throw new BadRequestException(ERROR_MESSAGES.TOKEN_INVALID_OR_EXPIRED);
    }

    const activatedUser = await userService.confirmEmail(payload.userId);

    return res.status(HttpStatusCode.OK).json(serializeResponse(activatedUser));
  }
}

export default new UserController();
