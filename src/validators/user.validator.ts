import Joi from 'joi';

import { USER_VALITATION_CONDITIONS } from '@/constants';
import { EMAIL_FIELD_SCHEMA } from './common.validator';

const { FIRST_NAME, LAST_NAME, PASSWORD } = USER_VALITATION_CONDITIONS;

export const createUserSchema = Joi.object({
  firstName: Joi.string().min(FIRST_NAME.MIN).max(FIRST_NAME.MAX).required(),
  lastName: Joi.string().min(LAST_NAME.MIN).max(LAST_NAME.MAX).required(),
  email: EMAIL_FIELD_SCHEMA,
  password: Joi.string().min(PASSWORD.MIN).max(PASSWORD.MAX).required(),
});
