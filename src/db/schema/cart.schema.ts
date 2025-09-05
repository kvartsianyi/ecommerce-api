import { relations } from 'drizzle-orm';
import { serial, pgTable, timestamp, integer, unique } from 'drizzle-orm/pg-core';

import users from './user.schema';
import cartItems from './cart-item.schema';

const carts = pgTable(
  'carts',
  {
    id: serial().primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  table => [unique('carts_user_id_unique').on(table.userId)],
);

export const cartRelations = relations(carts, ({ one, many }) => ({
  items: many(cartItems),
  user: one(users),
}));

export default carts;
