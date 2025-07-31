import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { userService, emailNotificationService, jwtService } from '@/services';
import { HttpStatusCode, AppAction, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants';
import { serializeResponse } from '@/utils';
import { EmailConfirmTokenPayload } from '@/models';
import { BadRequestException } from '@/exceptions';

class UserController {
  async createUser(req: Request, res: Response): Promise<Response> {
    const user = await userService.createUser(req.body);

    await emailNotificationService.sendUserEmailConfirmation(user);

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

  async sendConfirmEmail(req: Request, res: Response): Promise<Response> {
    const user = req.user!;

    if (user.isEmailConfirmed) {
      throw new BadRequestException(ERROR_MESSAGES.EMAIL_ALREADY_CONFIRMED);
    }

    await emailNotificationService.sendUserEmailConfirmation(user);

    return res.status(HttpStatusCode.OK).json(
      serializeResponse({
        message: SUCCESS_MESSAGES.EMAIL_SENT,
      }),
    );
  }
}

export default new UserController();
