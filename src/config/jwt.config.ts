import { AppAction } from '../constants/app.constant';
import { TokenConfigMap } from '@/models';
import ENV from './env.config';

export const TOKEN_CONFIG_MAP: TokenConfigMap = {
  [AppAction.USER_AUTH]: {
    ACCESS_TOKEN: {
      SECRET_KEY: ENV.JWT_EMAIL_CONFIRM_SECRET,
      LIFETIME: ENV.JWT_EMAIL_CONFIRM_LIFETIME,
    },
    REFRESH_TOKEN: {
      SECRET_KEY: ENV.JWT_EMAIL_CONFIRM_SECRET,
      LIFETIME: ENV.JWT_EMAIL_CONFIRM_LIFETIME,
    },
  },
  [AppAction.USER_CONFIRMATION]: {
    SECRET_KEY: ENV.JWT_EMAIL_CONFIRM_SECRET,
    LIFETIME: ENV.JWT_EMAIL_CONFIRM_LIFETIME,
  },
} as const;
