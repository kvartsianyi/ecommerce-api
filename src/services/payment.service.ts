import Stripe from 'stripe';

import { ENV } from '@/config';
import { OrderDetails } from '@/models';
import { OrderModel, PaymentModel, UserModel } from '@/db/models';
import { OrderStatus, PaymentStatus } from '@/constants';
import { withTransaction } from '@/db/transaction';

const stripe = new Stripe(ENV.STRIPE_SECRET_KEY);

class PaymentService {
  async createCheckoutSession(
    order: OrderDetails,
  ): Promise<Stripe.Response<Stripe.Checkout.Session>> {
    const customer = await UserModel.findById(order.userId);

    return stripe.checkout.sessions.create({
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
        userId: String(order.id),
      },
      customer_email: customer?.email,
      billing_address_collection: 'auto',
      client_reference_id: String(order.id),
      payment_method_types: ['card'],
      success_url: `${process.env.FRONTEND_URL}/thank-you?orderId=${order.id}`,
      cancel_url: `${process.env.FRONTEND_URL}/`,
    });
  }

  async retrieveCheckoutSession(
    sessionId: string,
  ): Promise<Stripe.Response<Stripe.Checkout.Session>> {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return session;
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  }

  async handleSessionCompleted(session: Stripe.Checkout.Session) {
    const orderId = Number(session.metadata?.orderId);
    const userId = Number(session.metadata?.userId);
    const paymentIntentId = String(session.payment_intent);

    await withTransaction<void>(async () => {
      const order = await OrderModel.findUnpaidById(orderId, userId);

      if (!order) return;

      await OrderModel.updateById(orderId, { status: OrderStatus.PAID });
      await PaymentModel.updateByOrderId(orderId, {
        status: PaymentStatus.PAID,
        stripePaymentId: paymentIntentId,
      });
    });
  }

  async handleSessionExpired(session: Stripe.Checkout.Session) {
    const orderId = Number(session.metadata?.orderId);
    const userId = Number(session.metadata?.userId);

    const order = await OrderModel.findActiveById(orderId, userId);

    if (!order) return;

    await OrderModel.updateById(orderId, { status: OrderStatus.CANCELED });
  }
}

export default new PaymentService();
