export const StripeEvent = {
  CheckoutSessionComplete: 'checkout.session.completed',
  CheckoutSessionExpired: 'checkout.session.expired',
  PaymentIntentFailed: 'payment_intent.payment_failed',
} as const;

export const SESSION_SUCCESS_URL = (orderId: number) =>
  `${process.env.FRONTEND_URL}/thank-you?orderId=${orderId}`;
export const SESSION_CANCEL_URL = `${process.env.FRONTEND_URL}/`;
