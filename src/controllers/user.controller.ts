import { Request, Response } from 'express';

import { userService, emailNotificationService, jwtService } from '@/services';
import { HttpStatusCode, TokenAction, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants';
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

    const payload = await jwtService.verifyToken<EmailConfirmTokenPayload>(
      token,
      TokenAction.USER_CONFIRMATION_TOKEN,
    );

    if (payload.action !== TokenAction.USER_CONFIRMATION_TOKEN) {
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

  async getMe(req: Request, res: Response): Promise<Response> {
    const user = req.user!;
    const publicUser = userService.toPublicUser(user);

    return res.status(HttpStatusCode.OK).json(serializeResponse(publicUser));
  }
}

export default new UserController();
