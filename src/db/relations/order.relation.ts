import { defineRelationsPart } from 'drizzle-orm';

import * as schema from '../schema';

export const orderRelations = defineRelationsPart(schema, r => ({
  orders: {
    user: r.one.users({
      from: r.orders.userId,
      to: r.users.id,
    }),
    items: r.many.orderItems({
      from: r.orders.id,
      to: r.orderItems.orderId,
    }),
    payment: r.one.payments({
      from: r.orders.id,
      to: r.payments.orderId,
    }),
  },
}));
