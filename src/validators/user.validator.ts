import Joi from 'joi';

import { USER_VALIDATION_CONDITIONS } from '@/constants';
import { EMAIL_FIELD_SCHEMA, PASSWORD_FIELD_SCHEMA, PHONE_FIELD_SCHEMA } from './common.validator';

const { NAME } = USER_VALIDATION_CONDITIONS;

export const createUserSchema = Joi.object({
  name: Joi.string().min(NAME.MIN).max(NAME.MAX).required(),
  phone: PHONE_FIELD_SCHEMA,
  email: EMAIL_FIELD_SCHEMA,
  password: PASSWORD_FIELD_SCHEMA,
}).required();
