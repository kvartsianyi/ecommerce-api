import Joi from 'joi';

import { ORDER_BY_FIELDS_SCHEMA, PAGINATION_FIELDS_SCHEMA } from './common.validator';
import { ORDER_ORDER_BY_FIELDS } from '@/models';
import { OrderStatus } from '@/constants';

export const getOrdersQuery = Joi.object({
  ...PAGINATION_FIELDS_SCHEMA,
  ...ORDER_BY_FIELDS_SCHEMA(ORDER_ORDER_BY_FIELDS),
  status: Joi.string().valid(...Object.values(OrderStatus)),
});
