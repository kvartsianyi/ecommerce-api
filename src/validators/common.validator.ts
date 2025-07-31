import Joi from 'joi';

import { USER_VALITATION_CONDITIONS } from '@/constants';

const { PASSWORD } = USER_VALITATION_CONDITIONS;

export const EMAIL_FIELD_SCHEMA = Joi.string().email().required();
export const PASSWORD_FIELD_SCHEMA = Joi.string().min(PASSWORD.MIN).max(PASSWORD.MAX).required();

export const tokenSchema = Joi.object({
  token: Joi.string().required(),
});

export const emailSchema = Joi.object({
  email: EMAIL_FIELD_SCHEMA,
});
