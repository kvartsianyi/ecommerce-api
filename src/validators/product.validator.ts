import Joi from 'joi';

import { PRODUCT_VALIDATION_CONDITIONS } from '@/constants';

const { TITLE, DESCRIPTION, PRICE, STOCK } = PRODUCT_VALIDATION_CONDITIONS;

const TITLE_VALIDATOR = Joi.string().min(TITLE.MIN).max(TITLE.MAX);
const DESCRIPTION_VALIDATOR = Joi.string().min(DESCRIPTION.MIN).max(DESCRIPTION.MAX);
const PRICE_VALIDATOR = Joi.number().integer().min(PRICE.MIN).max(PRICE.MAX);
const STOCK_VALIDATOR = Joi.number().integer().min(STOCK.MIN).max(STOCK.MAX);

export const createProductSchema = Joi.object({
  title: TITLE_VALIDATOR.required(),
  description: DESCRIPTION_VALIDATOR,
  price: PRICE_VALIDATOR.required(),
  stock: STOCK_VALIDATOR.required(),
});

export const updateProductSchema = Joi.object({
  title: TITLE_VALIDATOR,
  description: DESCRIPTION_VALIDATOR,
  price: PRICE_VALIDATOR,
  stock: STOCK_VALIDATOR,
}).min(1);
