export const StripeEvent = {
  PaymentIntentSucceeded: 'payment_intent.succeeded',
  PaymentIntentFailed: 'payment_intent.payment_failed',
  PaymentIntentCanceled: 'payment_intent.canceled',
} as const;
