import { SignOptions } from 'jsonwebtoken';

import { TokenAction, UserRole } from '@/constants';

export type TokenConfig = {
  SECRET_KEY: string;
  LIFETIME: SignOptions['expiresIn'];
};

export type TokenPairActions = {
  accessTokenAction: TokenAction.USER_ACCESS_TOKEN;
  refreshTokenAction: TokenAction.USER_REFRESH_TOKEN;
};

export type TokenConfigMap = {
  [K in TokenAction]: TokenConfig;
};

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface EmailConfirmTokenPayload {
  userId: number;
  role: UserRole;
  action: TokenAction.USER_CONFIRMATION_TOKEN;
}

export interface AuthTokenPairPayload {
  userId: number;
  role: UserRole;
}
