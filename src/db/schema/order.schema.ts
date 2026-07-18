import { sql } from 'drizzle-orm';
import { serial, pgTable, timestamp, integer, pgEnum, check, varchar } from 'drizzle-orm/pg-core';

import users from './user.schema';
import { OrderStatus, PickupMethod, REGEXP } from '@/constants';

const orderStatus = Object.values(OrderStatus) as [string, ...string[]];
const pickupMethod = Object.values(PickupMethod) as [string, ...string[]];

export const orderStatusEnum = pgEnum('order_status', orderStatus);
export const pickupMethodEnum = pgEnum('pickup_method', pickupMethod);

const orders = pgTable(
  'orders',
  {
    id: serial().primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    recipientName: varchar('recipient_name', { length: 50 }).notNull(),
    recipientPhone: varchar('recipient_phone', { length: 20 }).notNull(),
    status: orderStatusEnum().notNull().default(OrderStatus.PENDING),
    totalAmount: integer('total_amount').notNull(),
    pickupMethod: pickupMethodEnum('pickup_method').notNull(),
    deliveryAddress: varchar('delivery_address', { length: 100 }),
    comment: varchar('comment', { length: 200 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  table => [
    check('orders_total_amount_check', sql`${table.totalAmount} >= 0`),
    check('recipient_phone_check', sql`${table.recipientPhone} ~ ${REGEXP.PHONE_NUMBER.source}`),
  ],
);

export default orders;
