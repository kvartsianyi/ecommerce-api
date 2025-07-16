import { SignOptions } from 'jsonwebtoken';

import { AppAction } from '@/constants';

export type SingleTokenConfig = {
  SECRET_KEY: string;
  LIFETIME: SignOptions['expiresIn'];
};

export type DualTokenConfig = {
  ACCESS_TOKEN: SingleTokenConfig;
  REFRESH_TOKEN: SingleTokenConfig;
};

export type DualTokenActions = AppAction.USER_AUTH;
export type SingleTokenActions = Exclude<AppAction, DualTokenActions>;

export type TokenConfigMap = {
  [K in DualTokenActions]: DualTokenConfig;
} & {
  [K in SingleTokenActions]: SingleTokenConfig;
};

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
