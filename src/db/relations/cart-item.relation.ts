import { defineRelationsPart } from 'drizzle-orm';

import * as schema from '../schema';

export const cartItemRelations = defineRelationsPart(schema, r => ({
  cartItems: {
    cart: r.one.carts({
      from: r.cartItems.cartId,
      to: r.carts.id,
    }),
    product: r.one.products({
      from: r.cartItems.productId,
      to: r.products.id,
    }),
  },
}));
