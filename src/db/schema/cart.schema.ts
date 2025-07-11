import { relations } from 'drizzle-orm';
import { serial, pgTable, timestamp, integer } from 'drizzle-orm/pg-core';

import users from './user.schema';

const carts = pgTable('carts', {
  id: serial().primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const cartRelations = relations(carts, ({ one }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
}));

export default carts;
