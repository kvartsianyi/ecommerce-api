import { Request, Response } from 'express';

import { jwtService } from '@/services';
import { HttpStatusCode, AppAction, UserRole } from '@/constants';
import { serializeResponse } from '@/utils';
import { AuthTokenPairPayload } from '@/models';

class AuthController {
  async login(req: Request, res: Response): Promise<Response> {
    const user = req.user!;

    const payload: AuthTokenPairPayload = {
      userId: user.id!,
      role: user.role as UserRole,
    };
    const tokenPair = await jwtService.generateTokenPair(payload, AppAction.USER_AUTH);

    return res.status(HttpStatusCode.OK).json(serializeResponse(tokenPair));
  }
}

export default new AuthController();
