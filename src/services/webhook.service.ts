import Stripe from 'stripe';

import { ENV } from '@/config';
import { API_PREFIX, LoggerContext, OrderStatus, StripeEvent } from '@/constants';
import logger from '@/logger';
import { StripeProvider } from './payment/providers/stripe';

const stripe = new Stripe(ENV.STRIPE_SECRET_KEY);
const stripeProvider = new StripeProvider();
const STRIPE_WEBHOOK_URL = `${ENV.API_URL}${API_PREFIX}/webhooks/stripe`;

class WebhookService {
  async handleStripeEvent(event: Stripe.Event): Promise<void> {
    logger.info(`Recived event type ${event.type}`, {
      context: LoggerContext.STRIPE_WEBHOOK,
      eventId: event.id,
    });

    switch (event.type) {
      case StripeEvent.CheckoutSessionComplete:
        const sessionComplete = event.data.object as Stripe.Checkout.Session;

        await stripeProvider.handleSessionCompleted(sessionComplete);

        logger.info(`Order marked as ${OrderStatus.PAID}`, {
          context: LoggerContext.STRIPE_WEBHOOK,
          orderId: sessionComplete.metadata?.orderId,
          userId: sessionComplete.metadata?.userId,
          sessionId: sessionComplete.id,
          paymentIntentId: sessionComplete.payment_intent,
        });
        break;
      case StripeEvent.CheckoutSessionExpired:
        const sessionExpired = event.data.object as Stripe.Checkout.Session;

        await stripeProvider.handleSessionExpired(sessionExpired);

        logger.info(`Order marked as ${OrderStatus.CANCELED}`, {
          context: LoggerContext.STRIPE_WEBHOOK,
          orderId: sessionExpired.metadata?.orderId,
          userId: sessionExpired.metadata?.userId,
          sessionId: sessionExpired.id,
          paymentIntentId: sessionExpired.payment_intent,
        });
        break;
      case StripeEvent.PaymentIntentFailed:
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
          StripeEvent.CheckoutSessionComplete,
          StripeEvent.CheckoutSessionExpired,
          StripeEvent.PaymentIntentFailed,
        ],
        url: STRIPE_WEBHOOK_URL,
      });
    }

    logger.info('Stripe webhooks registered successfully!', {
      context: LoggerContext.STRIPE_WEBHOOK,
    });
  }
}

export default new WebhookService();
