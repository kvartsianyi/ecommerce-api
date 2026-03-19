import { Request, Response } from 'express';
import Stripe from 'stripe';

import { HttpStatusCode, LoggerContext } from '@/constants';
import { serializeResponse } from '@/utils';
import { ENV } from '@/config';
import webhookService from '@/services/webhook.service';
import logger from '@/logger';

const stripe = new Stripe(ENV.STRIPE_SECRET_KEY);
const endpointSecret = ENV.STRIPE_WEBHOOK_SECRET_KEY;

class WebhookController {
  async stripeWebhook(req: Request, res: Response): Promise<Response> {
    let event;

    try {
      const sig = req.headers['stripe-signature'] as string;

      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (error) {
      logger.error(`Webhook signature verification failed! Try to check secret.`, {
        context: LoggerContext.STRIPE_WEBHOOK,
        error,
      });
      return res.status(HttpStatusCode.BAD_REQUEST).json(serializeResponse({ success: false }));
    }

    await webhookService.handleStripeEvent(event);

    return res.status(HttpStatusCode.OK).json(serializeResponse({ success: true }));
  }
}

export default new WebhookController();
