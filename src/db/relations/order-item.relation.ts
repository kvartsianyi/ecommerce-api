import { defineRelationsPart } from 'drizzle-orm';

import * as schema from '../schema';

export const orderItemsRelations = defineRelationsPart(schema, r => ({
  orderItems: {
    order: r.one.orders({
      from: r.orderItems.orderId,
      to: r.orders.id,
    }),
    product: r.one.products({
      from: r.orderItems.productId,
      to: r.products.id,
    }),
  },
}));
