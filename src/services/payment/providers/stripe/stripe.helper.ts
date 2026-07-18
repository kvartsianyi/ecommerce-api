import Stripe from 'stripe';

import { OrderDetails } from '@/models';
import { SESSION_CANCEL_URL, SESSION_SUCCESS_URL } from '@/constants';

export class StripeHelper {
  static async buildSessionParams(
    order: OrderDetails,
    customerEmail: string,
  ): Promise<Stripe.Checkout.SessionCreateParams> {
    return {
      mode: 'payment',
      currency: 'uah',
      line_items: order.items.map(item => ({
        price_data: {
          currency: 'uah',
          product_data: {
            name: item.productTitle,
          },
          unit_amount: item.unitPrice,
        },
        quantity: item.quantity,
      })),
      metadata: {
        orderId: String(order.id),
        userId: String(order.userId),
      },
      customer_email: customerEmail,
      billing_address_collection: 'auto',
      client_reference_id: String(order.id),
      payment_method_types: ['card'],
      success_url: SESSION_SUCCESS_URL(order.id),
      cancel_url: SESSION_CANCEL_URL,
    };
  }
}
