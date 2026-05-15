import { sql } from 'drizzle-orm';
import { serial, pgTable, timestamp, integer, check, varchar, text } from 'drizzle-orm/pg-core';

import orders from './order.schema';
import products from './product.schema';

const orderItems = pgTable(
  'order_items',
  {
    id: serial().primaryKey(),
    orderId: integer('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    productTitle: varchar('product_title', { length: 50 }).notNull(),
    productDescription: text('product_description'),
    productImage: varchar('product_image', { length: 255 }),
    quantity: integer().notNull(),
    unitPrice: integer('unit_price').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  table => [
    check('order_items_product_quantity_check', sql`${table.quantity} > 0`),
    check('order_items_unit_price_check', sql`${table.unitPrice} >= 0`),
  ],
);

export default orderItems;
