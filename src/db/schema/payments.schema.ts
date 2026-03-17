import { sql } from 'drizzle-orm';
import { serial, pgTable, timestamp, integer, check, pgEnum, varchar } from 'drizzle-orm/pg-core';

import orders from './order.schema';
import { PaymentStatus } from '@/constants';

const paymentStatus = Object.values(PaymentStatus) as [string, ...string[]];

export const paymentStatusEnum = pgEnum('payment_status', paymentStatus);

const payments = pgTable(
  'payments',
  {
    id: serial().primaryKey(),
    orderId: integer('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    stripePaymentId: varchar('stripe_payment_id', { length: 255 }).notNull(),
    status: paymentStatusEnum().notNull().default(PaymentStatus.UNPAID),
    amount: integer('amount').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  table => [check('payments_amount_check', sql`${table.amount} >= 0`)],
);

export default payments;
