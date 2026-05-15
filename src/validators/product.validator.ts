import Joi from 'joi';

import { PRODUCT_VALIDATION_CONDITIONS } from '@/constants';
import { ORDER_BY_FIELDS_SCHEMA, PAGINATION_FIELDS_SCHEMA } from './common.validator';
import { PRODUCT_ORDER_BY_FIELDS } from '@/models';

const { TITLE, DESCRIPTION, PRICE } = PRODUCT_VALIDATION_CONDITIONS;

const TITLE_VALIDATOR = Joi.string().min(TITLE.MIN).max(TITLE.MAX);
const DESCRIPTION_VALIDATOR = Joi.string().min(DESCRIPTION.MIN).max(DESCRIPTION.MAX);
const PRICE_VALIDATOR = Joi.number().integer().min(PRICE.MIN).max(PRICE.MAX);

export const createProductSchema = Joi.object({
  title: TITLE_VALIDATOR.required(),
  description: DESCRIPTION_VALIDATOR,
  price: PRICE_VALIDATOR.required(),
}).required();

export const updateProductSchema = Joi.object({
  title: TITLE_VALIDATOR,
  description: DESCRIPTION_VALIDATOR,
  price: PRICE_VALIDATOR,
})
  .min(1)
  .required();

export const getProductsQuery = Joi.object({
  ...PAGINATION_FIELDS_SCHEMA,
  ...ORDER_BY_FIELDS_SCHEMA(PRODUCT_ORDER_BY_FIELDS),
  title: Joi.string().max(TITLE.MAX).trim(),
  priceGt: PRICE_VALIDATOR,
  priceLt: PRICE_VALIDATOR,
});
