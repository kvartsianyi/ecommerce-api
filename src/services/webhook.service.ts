import Stripe from 'stripe';

import { ENV } from '@/config';
import { API_PREFIX, LoggerContext, PaymentStatus, StripeEvent } from '@/constants';
import logger from '@/logger';
import paymentService from './payment.service';

const stripe = new Stripe(ENV.STRIPE_SECRET_KEY);
const STRIPE_WEBHOOK_URL = `${ENV.API_URL}${API_PREFIX}/webhooks/stripe`;

class WebhookService {
  async stripeWebhookHandler(event: Stripe.Event): Promise<void> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const stripeLogMeta = {
      context: LoggerContext.STRIPE_WEBHOOK,
      orderId: paymentIntent.metadata.orderId,
      paymentIntentId: paymentIntent.id,
    };

    logger.info(`Recived event type ${event.type}`, stripeLogMeta);

    switch (event.type) {
      case StripeEvent.PaymentIntentSucceeded:
        await paymentService.handlePaymentSucceeded(paymentIntent);

        logger.info(`Order marked as ${PaymentStatus.PAID}`, stripeLogMeta);
        break;
      case StripeEvent.PaymentIntentFailed:
        break;
      case StripeEvent.PaymentIntentCanceled:
        break;
      default:
        logger.error(`Unhandled event type ${event.type}`, {
          context: LoggerContext.STRIPE_WEBHOOK,
        });
    }
  }

  async ensureStripeWebhookExists(): Promise<void> {
    const webhookEndpoints = await stripe.webhookEndpoints.list();

    const existingEndpoint = webhookEndpoints.data.find(
      endpoint => endpoint.url === STRIPE_WEBHOOK_URL,
    );

    if (!existingEndpoint) {
      await stripe.webhookEndpoints.create({
        enabled_events: [
          StripeEvent.PaymentIntentSucceeded,
          StripeEvent.PaymentIntentFailed,
          StripeEvent.PaymentIntentCanceled,
        ],
        url: STRIPE_WEBHOOK_URL,
      });
    }
  }
}

export default new WebhookService();
