import Joi from 'joi';

import { EMAIL_FIELD_SCHEMA, PASSWORD_FIELD_SCHEMA } from './common.validator';

export const loginSchema = Joi.object({
  email: EMAIL_FIELD_SCHEMA,
  password: PASSWORD_FIELD_SCHEMA,
});
