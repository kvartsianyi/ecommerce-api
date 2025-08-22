import Joi from 'joi';

import { USER_VALIDATION_CONDITIONS } from '@/constants';
import { EMAIL_FIELD_SCHEMA, PASSWORD_FIELD_SCHEMA } from './common.validator';

const { FIRST_NAME, LAST_NAME } = USER_VALIDATION_CONDITIONS;

export const createUserSchema = Joi.object({
  firstName: Joi.string().min(FIRST_NAME.MIN).max(FIRST_NAME.MAX).required(),
  lastName: Joi.string().min(LAST_NAME.MIN).max(LAST_NAME.MAX).required(),
  email: EMAIL_FIELD_SCHEMA,
  password: PASSWORD_FIELD_SCHEMA,
});
