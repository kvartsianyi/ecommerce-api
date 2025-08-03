export const DEFAULT_PORT = 3000 as const;

export const API_PREFIX = '/api' as const;

export enum NodeEnv {
  DEVELOPMENT = 'development',
  TEST = 'test',
  PRODUCTION = 'production',
}

export enum TokenAction {
  USER_ACCESS_TOKEN = 'user-access-token',
  USER_REFRESH_TOKEN = 'user-refresh-token',
  USER_CONFIRMATION_TOKEN = 'user-confirmation-token',
}
