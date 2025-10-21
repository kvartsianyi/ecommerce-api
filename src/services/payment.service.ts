import Stripe from 'stripe';

import { ENV } from '@/config';
import db from '@/db';
import { payments } from '@/db/schema';
import orderService from './order.service';

const stripe = new Stripe(ENV.STRIPE_SECRET_KEY);

interface CreatePaymentIntentBody {
  amount: number;
  orderId: number;
  customerEmail?: string;
  description?: string;
}

class PaymentService {
  async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const orderId = Number(paymentIntent.metadata.orderId);

    await orderService.markOrderPaid(orderId);
  }

  async createPaymentIntent({
    amount,
    orderId,
    customerEmail,
    description,
  }: CreatePaymentIntentBody): Promise<Stripe.PaymentIntent> {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      description: description ?? `Payment for order ${orderId}`,
      receipt_email: customerEmail,
      metadata: { orderId },
      payment_method_types: ['card'],
    });

    await db.insert(payments).values({
      orderId,
      stripePaymentId: paymentIntent.id,
      amount,
    });

    return paymentIntent;
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  }
}

export default new PaymentService();
