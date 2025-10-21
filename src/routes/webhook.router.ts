import express, { Router } from 'express';

import { webhookController } from '@/controllers';

const webhookRouter = Router();

webhookRouter.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  webhookController.stripeWebhook,
);

export default webhookRouter;
