import Joi from 'joi';

import { USER_VALITATION_CONDITIONS } from '@/constants';

const { FIRST_NAME, LAST_NAME, PASSWORD } = USER_VALITATION_CONDITIONS;

export const createUserSchema = Joi.object({
  firstName: Joi.string().min(FIRST_NAME.MIN).max(FIRST_NAME.MAX),
  lastName: Joi.string().min(LAST_NAME.MIN).max(LAST_NAME.MAX),
  email: Joi.string().email(),
  password: Joi.string().min(PASSWORD.MIN).max(PASSWORD.MAX),
});
