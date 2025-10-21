import { Request, Response } from 'express';
import Stripe from 'stripe';

import { HttpStatusCode } from '@/constants';
import { serializeResponse } from '@/utils';
import { ENV } from '@/config';
import webhookService from '@/services/webhook.service';

const stripe = new Stripe(ENV.STRIPE_SECRET_KEY);

class WebhookController {
  async stripeWebhook(req: Request, res: Response): Promise<Response> {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = ENV.STRIPE_WEBHOOK_SECRET_KEY;

    const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

    await webhookService.stripeWebhookHandler(event);

    return res.status(HttpStatusCode.OK).json(serializeResponse({}));
  }
}

export default new WebhookController();
