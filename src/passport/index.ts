import passport from 'passport';

import { localStrategy, jwtTokenStrategy } from './strategies';
import { TOKEN_CONFIG_MAP } from '@/config';
import { TokenAction } from '@/constants';

export enum PassportStrategy {
  LOCAL = 'local',
  ACCESS_TOKEN = 'access-token',
  REFRESH_TOKEN = 'refresh-token',
}

const accessTokenSecret = TOKEN_CONFIG_MAP[TokenAction.USER_ACCESS_TOKEN].SECRET_KEY;
const refreshTokenSecret = TOKEN_CONFIG_MAP[TokenAction.USER_REFRESH_TOKEN].SECRET_KEY;

passport
  .use(PassportStrategy.LOCAL, localStrategy)
  .use(PassportStrategy.ACCESS_TOKEN, jwtTokenStrategy(accessTokenSecret))
  .use(PassportStrategy.REFRESH_TOKEN, jwtTokenStrategy(refreshTokenSecret));
