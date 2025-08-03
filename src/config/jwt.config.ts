import { TokenAction } from '../constants/app.constant';
import { TokenConfigMap } from '@/models';
import ENV from './env.config';

export const TOKEN_CONFIG_MAP: TokenConfigMap = {
  [TokenAction.USER_ACCESS_TOKEN]: {
    SECRET_KEY: ENV.JWT_ACCESS_TOKEN_SECRET,
    LIFETIME: ENV.JWT_ACCESS_TOKEN_LIFETIME,
  },
  [TokenAction.USER_REFRESH_TOKEN]: {
    SECRET_KEY: ENV.JWT_REFRESH_TOKEN_SECRET,
    LIFETIME: ENV.JWT_REFRESH_TOKEN_LIFETIME,
  },
  [TokenAction.USER_CONFIRMATION_TOKEN]: {
    SECRET_KEY: ENV.JWT_EMAIL_CONFIRM_SECRET,
    LIFETIME: ENV.JWT_EMAIL_CONFIRM_LIFETIME,
  },
} as const;
