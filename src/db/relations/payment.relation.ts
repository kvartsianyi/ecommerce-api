import { defineRelationsPart } from 'drizzle-orm';

import * as schema from '../schema';

export const paymentRelations = defineRelationsPart(schema, r => ({
  payments: {
    order: r.one.orders({
      from: r.payments.orderId,
      to: r.orders.id,
    }),
  },
}));
