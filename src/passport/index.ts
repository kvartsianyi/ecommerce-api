import passport from 'passport';

import { localStrategy } from './strategies';

export enum PassportStrategy {
  LOCAL = 'local',
}

passport.use(localStrategy);
