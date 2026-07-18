import { payments } from '@/db/schema';

export type CreatePayment = typeof payments.$inferInsert;
export type Payment = typeof payments.$inferSelect;

export interface CheckoutSessionDetails {
  orderId: number;
  paymentUrl: string | null;
}
export interface CreatePaymentResult {
  paymentId: string | null;
  paymentUrl: string | null;
  raw?: unknown;
}

export interface PaymentProvider {
  createPayment(orderId: number): Promise<CreatePaymentResult>;
}
