import Joi from 'joi';

export const EMAIL_FIELD_SCHEMA = Joi.string().email().required();

export const tokenSchema = Joi.object({
  token: Joi.string().required(),
});

export const emailSchema = Joi.object({
  email: EMAIL_FIELD_SCHEMA,
});
