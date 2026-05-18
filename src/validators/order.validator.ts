import Joi from 'joi';

import {
  ORDER_BY_FIELDS_SCHEMA,
  PAGINATION_FIELDS_SCHEMA,
  PHONE_FIELD_SCHEMA,
} from './common.validator';
import { ORDER_ORDER_BY_FIELDS } from '@/models';
import {
  OrderStatus,
  PaymentMethod,
  PickupMethod,
  USER_VALIDATION_CONDITIONS,
  ORDER_VALIDATION_CONDITIONS,
} from '@/constants';

const { NAME } = USER_VALIDATION_CONDITIONS;
const { DELIVERY_ADDRESS, COMMENT } = ORDER_VALIDATION_CONDITIONS;

export const checkoutSchema = Joi.object({
  recipientName: Joi.string().min(NAME.MIN).max(NAME.MAX).required(),
  recipientPhone: PHONE_FIELD_SCHEMA,
  deliveryAddress: Joi.string()
    .min(DELIVERY_ADDRESS.MIN)
    .max(DELIVERY_ADDRESS.MAX)
    .when('pickupMethod', {
      is: PickupMethod.DELIVERY,
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
  pickupMethod: Joi.string()
    .valid(...Object.values(PickupMethod))
    .required(),
  paymentMethod: Joi.string()
    .valid(...Object.values(PaymentMethod))
    .required(),
  comment: Joi.string().min(COMMENT.MIN).max(COMMENT.MAX).optional(),
});

export const getOrdersQuery = Joi.object({
  ...PAGINATION_FIELDS_SCHEMA,
  ...ORDER_BY_FIELDS_SCHEMA(ORDER_ORDER_BY_FIELDS),
  status: Joi.string().valid(...Object.values(OrderStatus)),
});
