import passport from 'passport';

import { localStrategy, refreshTokenStrategy } from './strategies';

export enum PassportStrategy {
  LOCAL = 'local',
  REFRESH_TOKEN = 'refresh-token',
}

passport
  .use(PassportStrategy.LOCAL, localStrategy)
  .use(PassportStrategy.REFRESH_TOKEN, refreshTokenStrategy);
