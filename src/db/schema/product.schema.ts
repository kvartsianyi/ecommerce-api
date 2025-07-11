import { relations, sql } from 'drizzle-orm';
import {
  serial,
  pgTable,
  varchar,
  timestamp,
  text,
  integer,
  check,
  index,
} from 'drizzle-orm/pg-core';

import users from './user.schema';

const products = pgTable(
  'products',
  {
    id: serial().primaryKey(),
    title: varchar({ length: 50 }).notNull(),
    description: text(),
    picture: varchar({ length: 255 }),
    price: integer().notNull(),
    stock: integer().notNull(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  table => [
    check('products_price_check', sql`${table.price} >= 0`),
    check('products_stock_check', sql`${table.stock} >= 0`),
    index('products_title_idx').on(table.title),
  ],
);

export const productRelations = relations(products, ({ one }) => ({
  user: one(users, {
    fields: [products.userId],
    references: [users.id],
  }),
}));

export default products;
