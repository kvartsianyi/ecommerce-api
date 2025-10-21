export const DEFAULT_PORT = 3000 as const;

export const API_PREFIX = '/api' as const;

export const PUBLIC_ASSETS_ENDPOINT = '/public' as const;

export const DEFAULT_PAGE_NUMBER = 1 as const;
export const DEFAULT_ITEMS_PER_PAGE = 10 as const;

export enum NodeEnv {
  DEVELOPMENT = 'development',
  TEST = 'test',
  PRODUCTION = 'production',
}

export enum LoggerContext {
  BOOTSTRAP = 'Bootstrap',
  CONFIG = 'Config',
  ERROR_HANDLER = 'ErrorHandler',
  STRIPE_WEBHOOK = 'StripeWebhook',
}

export enum TokenAction {
  USER_ACCESS_TOKEN = 'user-access-token',
  USER_REFRESH_TOKEN = 'user-refresh-token',
  USER_CONFIRMATION_TOKEN = 'user-confirmation-token',
}
