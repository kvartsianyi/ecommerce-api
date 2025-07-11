import { relations, sql } from 'drizzle-orm';
import { serial, pgTable, timestamp, integer, check, pgEnum } from 'drizzle-orm/pg-core';

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
    stripePaymentId: integer('stripe_payment_id').notNull(),
    status: paymentStatusEnum().notNull(),
    amount: integer('amount').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  table => [check('payments_amount_check', sql`${table.amount} >= 0`)],
);

export const paymentRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

export default payments;
