import { payments } from '@/db/schema';

export type Payment = typeof payments.$inferSelect;

export interface CheckoutSessionDetails {
  paymentUrl: string | null;
}
