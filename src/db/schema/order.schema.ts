import { sql } from 'drizzle-orm';
import { serial, pgTable, timestamp, integer, pgEnum, check } from 'drizzle-orm/pg-core';

import users from './user.schema';
import { OrderStatus } from '@/constants';

const orderStatus = Object.values(OrderStatus) as [string, ...string[]];

export const orderStatusEnum = pgEnum('order_status', orderStatus);

const orders = pgTable(
  'orders',
  {
    id: serial().primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: orderStatusEnum().notNull().default(OrderStatus.PENDING),
    totalAmount: integer('total_amount').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  table => [check('orders_total_amount_check', sql`${table.totalAmount} >= 0`)],
);

export default orders;
