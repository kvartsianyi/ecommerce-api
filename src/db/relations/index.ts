import { defineRelationsPart } from 'drizzle-orm';

import * as schema from '../schema';
import { productRelations } from './product.relation';
import { cartRelations } from './cart.relation';
import { cartItemRelations } from './cart-item.relation';
import { orderRelations } from './order.relation';
import { orderItemsRelations } from './order-item.relation';
import { paymentRelations } from './payment.relation';

export const mainPart = defineRelationsPart(schema);

export const relations = {
  ...mainPart,
  ...productRelations,
  ...cartRelations,
  ...cartItemRelations,
  ...orderRelations,
  ...orderItemsRelations,
  ...paymentRelations,
};
