import Joi from 'joi';

import { NUMBER_ID_FIELD_SCHEMA } from './common.validator';

const QUANTITY_FIELD_SCHEMA = Joi.number().integer().positive().max(100_000).required();

export const addItemToCartSchema = Joi.object({
  productId: NUMBER_ID_FIELD_SCHEMA,
  quantity: QUANTITY_FIELD_SCHEMA,
}).required();

export const updateCartItemSchema = Joi.object({
  quantity: QUANTITY_FIELD_SCHEMA,
}).required();
