import Joi from 'joi';

import {
  DEFAULT_ITEMS_PER_PAGE,
  DEFAULT_PAGE_NUMBER,
  REGEXP,
  USER_VALIDATION_CONDITIONS,
} from '@/constants';
import { OrderDirection } from '@/models';

const { PASSWORD } = USER_VALIDATION_CONDITIONS;

export const NUMBER_ID_FIELD_SCHEMA = Joi.number().integer().min(0).required();
export const EMAIL_FIELD_SCHEMA = Joi.string().email().required();
export const PHONE_FIELD_SCHEMA = Joi.string().pattern(REGEXP.PHONE_NUMBER).required();
export const PASSWORD_FIELD_SCHEMA = Joi.string().min(PASSWORD.MIN).max(PASSWORD.MAX).required();

export const PAGINATION_FIELDS_SCHEMA = {
  page: Joi.number().integer().min(1).default(DEFAULT_PAGE_NUMBER),
  perPage: Joi.number().integer().min(1).max(100).default(DEFAULT_ITEMS_PER_PAGE),
};

export const ORDER_BY_FIELDS_SCHEMA = (orderByFields: readonly string[]) => ({
  orderBy: Joi.string().valid(...orderByFields),
  orderDir: Joi.string().valid(...Object.values(OrderDirection)),
});

export const idParamSchema = Joi.object({
  id: NUMBER_ID_FIELD_SCHEMA,
}).required();

export const tokenSchema = Joi.object({
  token: Joi.string().required(),
}).required();

export const emailSchema = Joi.object({
  email: EMAIL_FIELD_SCHEMA,
}).required();
