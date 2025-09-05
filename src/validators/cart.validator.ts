import Joi from 'joi';

import { NUMBER_ID_FIELD_SCHEMA } from './common.validator';

export const addItemToCartSchema = Joi.object({
  productId: NUMBER_ID_FIELD_SCHEMA,
  quantity: Joi.number().integer().positive().required(),
}).required();
