import Joi from 'joi';

import { USER_VALIDATION_CONDITIONS } from '@/constants';

const { PASSWORD } = USER_VALIDATION_CONDITIONS;

export const EMAIL_FIELD_SCHEMA = Joi.string().email().required();
export const PASSWORD_FIELD_SCHEMA = Joi.string().min(PASSWORD.MIN).max(PASSWORD.MAX).required();

export const idParamSchema = Joi.object({
  id: Joi.number().integer().min(0).required(),
}).required();

export const tokenSchema = Joi.object({
  token: Joi.string().required(),
}).required();

export const emailSchema = Joi.object({
  email: EMAIL_FIELD_SCHEMA,
}).required();
