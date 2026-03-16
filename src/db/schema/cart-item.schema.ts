import { sql } from 'drizzle-orm';
import { serial, pgTable, timestamp, integer, check, unique } from 'drizzle-orm/pg-core';

import products from './product.schema';
import carts from './cart.schema';

const cartItems = pgTable(
  'cart_items',
  {
    id: serial().primaryKey(),
    cartId: integer('cart_id')
      .notNull()
      .references(() => carts.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    quantity: integer().notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  table => [
    check('cart_items_product_quantity_check', sql`${table.quantity} > 0`),
    unique('cart_items_cart_id_product_id_unique').on(table.cartId, table.productId),
  ],
);

export default cartItems;
