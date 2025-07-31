import { SignOptions } from 'jsonwebtoken';

import { AppAction, UserRole } from '@/constants';

export type TokenConfig = {
  SECRET_KEY: string;
  LIFETIME: SignOptions['expiresIn'];
};

export type DualTokenConfig = {
  ACCESS_TOKEN: TokenConfig;
  REFRESH_TOKEN: TokenConfig;
};

export type DualTokenActions = AppAction.USER_AUTH;
export type SingleTokenActions = Exclude<AppAction, DualTokenActions>;

export type TokenConfigMap = {
  [K in DualTokenActions]: DualTokenConfig;
} & {
  [K in SingleTokenActions]: TokenConfig;
};

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface EmailConfirmTokenPayload {
  userId: number;
  role: UserRole;
  action: AppAction.USER_CONFIRMATION;
}

export interface AuthTokenPairPayload {
  userId: number;
  role: UserRole;
}
