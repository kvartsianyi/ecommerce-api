import Joi from 'joi';

import { PRODUCT_VALIDATION_CONDITIONS } from '@/constants';

const { TITLE, DESCRIPTION, PRICE, STOCK } = PRODUCT_VALIDATION_CONDITIONS;

export const createProductSchema = Joi.object({
  title: Joi.string().min(TITLE.MIN).max(TITLE.MAX).required(),
  description: Joi.string().min(DESCRIPTION.MIN).max(DESCRIPTION.MAX),
  price: Joi.number().integer().min(PRICE.MIN).max(PRICE.MAX).required(),
  stock: Joi.number().integer().min(STOCK.MIN).max(STOCK.MAX).required(),
});
