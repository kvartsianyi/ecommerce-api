import { PaymentMethod } from '@/constants';
import { StripeProvider } from './stripe';

export class PaymentFactory {
  static create(method: Omit<PaymentMethod, PaymentMethod.CASH>) {
    switch (method) {
      case PaymentMethod.STRIPE:
        return new StripeProvider();
      default:
        throw new Error('Unsupported payment method');
    }
  }
}
