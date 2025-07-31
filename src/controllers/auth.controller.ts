import { Request, Response } from 'express';

import { jwtService } from '@/services';
import { HttpStatusCode, TokenAction, UserRole } from '@/constants';
import { serializeResponse } from '@/utils';
import { AuthTokenPairPayload } from '@/models';

class AuthController {
  async login(req: Request, res: Response): Promise<Response> {
    const user = req.user!;

    const payload: AuthTokenPairPayload = {
      userId: user.id!,
      role: user.role as UserRole,
    };
    const tokenPair = await jwtService.generateTokenPair(payload, {
      accessTokenAction: TokenAction.USER_ACCESS_TOKEN,
      refreshTokenAction: TokenAction.USER_REFRESH_TOKEN,
    });

    return res.status(HttpStatusCode.OK).json(serializeResponse(tokenPair));
  }

  async tokenRefresh(req: Request, res: Response): Promise<Response> {
    const user = req.user!;

    const payload: AuthTokenPairPayload = {
      userId: user.id!,
      role: user.role as UserRole,
    };
    const accessToken = await jwtService.generateToken(payload, TokenAction.USER_ACCESS_TOKEN);

    return res.status(HttpStatusCode.OK).json(serializeResponse({ accessToken }));
  }
}

export default new AuthController();
