import Stripe from 'stripe';

import { ENV } from '@/config';
import { CreatePaymentResult, OrderDetails, PaymentProvider } from '@/models';
import { ERROR_MESSAGES, OrderStatus, PaymentStatus } from '@/constants';
import { OrderModel, PaymentModel, UserModel } from '@/db/models';
import { NotFoundException } from '@/exceptions';
import { StripeHelper } from './stripe.helper';
import { withTransaction } from '@/db/transaction';

const stripe = new Stripe(ENV.STRIPE_SECRET_KEY);

export class StripeProvider implements PaymentProvider {
  async createPayment(orderId: number): Promise<CreatePaymentResult> {
    const order = await OrderModel.getOrderDetails(orderId);

    if (!order) {
      throw new NotFoundException(ERROR_MESSAGES.ORDER_DOES_NOT_EXIST);
    }

    const customer = await UserModel.findById(order.userId);

    if (!customer) {
      throw new NotFoundException(ERROR_MESSAGES.USER_DOES_NOT_EXIST);
    }

    const session = await this.createSession(order, customer.email);

    return {
      paymentId: session.id,
      paymentUrl: session.url,
      raw: session,
    };
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

  private async createSession(
    order: OrderDetails,
    customerEmail: string,
  ): Promise<Stripe.Response<Stripe.Checkout.Session>> {
    const sessionParams = await StripeHelper.buildSessionParams(order, customerEmail);

    return stripe.checkout.sessions.create(sessionParams);
  }
}
