import { defineRelationsPart } from 'drizzle-orm';

import * as schema from '../schema';

export const cartRelations = defineRelationsPart(schema, r => ({
  carts: {
    user: r.one.users({
      from: r.carts.userId,
      to: r.users.id,
    }),
    items: r.many.cartItems({
      from: r.carts.id,
      to: r.cartItems.cartId,
    }),
  },
}));
